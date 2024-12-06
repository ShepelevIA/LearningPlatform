import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const role = request.input('role')

      let query = User.query().select('user_id', 'name', 'email', 'role', 'created_at', 'updated_at')

      if (role) {
        query = query.where('role', role)
      }

      const paginatedUsers = await query.paginate(page, limit)

      const response_users = paginatedUsers.toJSON()
      response_users.data = response_users.data.map(user => {
        return {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      })

      return response.status(200).json(response_users)
    } catch (error) {

      return response.status(500).json({
        message: 'Произошла ошибка при получении списка пользователей.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async create({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'email', 'password', 'role'])

      const allowedRoles = ['student', 'teacher', 'admin']

      if (!allowedRoles.includes(data.role)) {
        return response.status(400).json({
          message: 'Неверная роль. Допустимые роли: student, teacher, admin.'
        })
      }

      const user = await User.create(data)

      await user.save()

      return response.status(201).json({
        message: 'Пользователь успешно создан!',
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      })
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        return response.status(400).json({
          message: 'Пользователь с таким email уже существует.'
        })
      }
      else if(error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого пользователя не существует!',
        })
      }

      return response.status(500).json({
        message: 'Произошла ошибка при создании пользователя.',
        error: error.message
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      return response.status(200).json({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      })
    } catch (error) {
      if(error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого пользователя не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при получении данных о пользователе.',
        error: error.message
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'email', 'password', 'role'])

      const allowedRoles = ['student', 'teacher', 'admin']

      if (!allowedRoles.includes(data.role)) {
        return response.status(400).json({
          message: 'Неверная роль. Допустимые роли: student, teacher, admin.'
        })
      }

      const user = await User.findOrFail(params.id)
      user.name = data.name
      user.email = data.email
      user.password = data.password
      user.role = data.role
  
      await user.save()

      return response.status(200).json({
        message: 'Данные пользователя успешно обновлены!',
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }) 
    } catch (error) {
      if(error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого пользователя не существует!',
        })
      }
      else if (error.message.includes('Duplicate entry')) {
        return response.status(400).json({
          message: 'Пользователь с таким email уже существует.'
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении данных пользователя.',
        error: error.message
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {

    try {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.status(204).noContent()
    } catch (error) {
      if(error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого пользователя не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении пользователя.',
        error: error.message
      })
    }
  }
}