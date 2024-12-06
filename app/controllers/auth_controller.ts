import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class AuthController {
  public async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])
      
    const user = await User.query().where('email', email).first()

    if (!user || !(await hash.verify(user.password, password))) {
      return response.status(401).json({
        message: 'Неправильный email или пароль',
      })
    }

      const access_token = await User.accessTokens.create(user)

      const createToken = await User.find(user.user_id)

      if (createToken) {
        createToken.api_token = access_token.value?.release() ?? null
        await createToken.save()
      }

      return response.status(200).json({
        user_id: user.user_id, 
        email: user.email, 
        access_token: access_token.value?.release(), 
        role: user.role 
      })
      
    } catch (error) {
      return response.status(500).json({
        message: 'Ошибка авторизации',
        error: error.message
      })
    }
  }
  
  public async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }
  
      if (!user.currentAccessToken) {
        return response.status(400).json({ message: 'Текущий токен доступа не найден' })
      }

      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
  
      const deleteToken = await User.find(user.user_id)
      if (deleteToken) {
        deleteToken.api_token = null
        await deleteToken.save()
      }
  
      return response.status(204).json({ message: 'Пользователь вышел из системы' })
  
    } catch (error) {
      return response.status(500).json({
        message: 'Ошибка при выходе из системы',
        error: error.message
      })
    }
  }

  public async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      return response.status(200).json({
        user_id: user.user_id,
        email: user.email,
        role: user.role
      })

    } catch (error) {
      console.error('Me error:', error)
      return response.status(500).json({
        message: 'Ошибка получения личных данных',
        error: error.message
      })
    }
  }
}
