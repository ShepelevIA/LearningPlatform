import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import Token from '#models/token'
import { createHash } from 'crypto'
import { AccessToken } from '@adonisjs/auth/access_tokens'

import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    try {
      const data = request.only(['email', 'password'])

      try {
        await loginValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }

      const user = await User.query().where('email', data.email).first()

      if (!user || !(await hash.verify(user.password, data.password))) {
        return response.status(401).json({
          message: 'Неправильный email или пароль',
        })
      }

      if (!user.is_verified) {
        return response.status(403).json({
          message: 'Ваш аккаунт не подтвержден',
        })
      }

      const maxSessions = 5

      const tokens = await Token.query()
        .where('tokenable_id', user.user_id)
        .andWhere('type', 'refresh_token')
        .orderBy('created_at', 'asc')
      
      if (tokens.length >= maxSessions) {
        const tokensToDelete = tokens.slice(0, tokens.length - maxSessions + 1)
      
        for (const token of tokensToDelete) {
          const createdAtSQL = token.createdAt?.toSQL({ includeOffset: false })
      
          if (createdAtSQL) {
            
          await Token.query()
              .where('tokenable_id', user.user_id)
              .andWhere('type', 'auth_token')
              .andWhereRaw('created_at = ?', [createdAtSQL])
              .delete()
          }
      
          await token.delete()
        }
      }

      const accessToken = await User.accessTokens.create(user)
      const refreshToken = await User.refreshTokens.create(user)

      return response.status(200).json({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        access_token: accessToken.value?.release(),
        refresh_token: refreshToken.value?.release(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Ошибка авторизации',
        error: error.message,
      })
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const data = request.only(['last_name', 'first_name', 'middle_name', 'email', 'role', 'password', 'confirmPassword'])

      try {
        await registerValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }

      const allowedRoles = ['student', 'teacher', 'admin']

      if (!allowedRoles.includes(data.role)) {
        return response.status(400).json({
          message: 'Неверная роль. Допустимые роли: student, teacher, admin.',
        })
      }

      if (data.password !== data.confirmPassword) {
        return response.status(400).json({
          message: 'Пароли не совпадают',
        })
      }

      const user = await User.create({
        last_name: data.last_name,
        first_name: data.first_name,
        middle_name: data.middle_name,
        email: data.email,
        role: data.role,
        password: data.password,
        is_verified: false,
      })

      return response.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user: {
          user_id: user.user_id,
          last_name: user.last_name,
          first_name: user.first_name,
          middle_name: user.middle_name,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
        },
      })
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        return response.status(400).json({
          message: 'Пользователь с таким email уже существует.',
        })
      }
      return response.status(500).json({
        message: 'Ошибка регистрации',
        error: error.message,
      })
    }
  }

  async refreshToken({ request, response }: HttpContext) {
    try {
      const { refresh_token } = request.only(['refresh_token'])

      if (!refresh_token) {
        return response.badRequest({ message: 'Токен не предоставлен' })
      }

      const prefix = 'refresh_'
      const decoded = AccessToken.decode(prefix, refresh_token)
      if (!decoded) {
        return response.unauthorized({ message: 'Недействительный токен' })
      }

      const { identifier, secret } = decoded

      const hashedClientRefreshToken = createHash('sha256').update(secret.release()).digest('hex')

      const tokenRecord = await Token.query()
        .where('type', 'refresh_token')
        .where('id', identifier)
        .where('hash', hashedClientRefreshToken)
        .first()

      if (!tokenRecord) {
        return response.unauthorized({ message: 'Недействительный токен' })
      }

      const user = await User.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.unauthorized({ message: 'Пользователь не найден' })
      }

      const oldAccessToken = await Token.query()
        .where('type', 'auth_token')
        .where('tokenable_id', user.user_id)
        .first()

      if (oldAccessToken) {
        await oldAccessToken.delete()
      }

      const newAccessToken = await User.accessTokens.create(user)

      return response.status(200).json({
        access_token: newAccessToken.value?.release(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Ошибка обновления токена',
        error: error.message,
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user || !user.currentAccessToken) {
        return response.status(400).json({
          message: 'Токен доступа отсутствует',
        })
      }

      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      await user.save()

      return response.status(204).json({ message: 'Вы успешно вышли' })
    } catch (error) {
      return response.status(500).json({
        message: 'Ошибка при выходе',
        error: error.message,
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }

      return response.status(200).json({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Ошибка получения данных',
        error: error.message,
      })
    }
  }
}