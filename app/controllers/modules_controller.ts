import type { HttpContext } from '@adonisjs/core/http'
import Module from '#models/module'
import Course from '#models/course'
import User from '#models/user'
import Enrollment from '#models/enrollment'

import { moduleValidator } from '#validators/module'

export default class ModulesController {
  /**
   * Display a list of modules
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
  
      let query = Module
        .query()
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
  
      if (user.role === 'student') {
        query = query.innerJoin('enrollments', 'courses.course_id', 'enrollments.course_id')
          .where('enrollments.student_id', user.user_id)
      } else if (user.role === 'teacher') {
        query = query.where('courses.teacher_id', user.user_id)
      }
  
      const paginatedModules = await query
        .select(
          'modules.module_id',
          'modules.title',
          'modules.content',
          'modules.order',
          'modules.created_at',
          'modules.updated_at',
          'courses.course_id',
          'courses.title as course_title',
          'courses.description as course_description',
          'teachers.user_id as teacher_id',
          'teachers.first_name as teacher_first_name',
          'teachers.last_name as teacher_last_name',
          'teachers.middle_name as teacher_middle_name',
          'teachers.email as teacher_email',
          'teachers.role as teacher_role'
        )
        .paginate(page, limit)
  
      const paginatedModulesJson = paginatedModules.toJSON()
      paginatedModulesJson.data = paginatedModulesJson.data.map(module => {
        return {
          module_id: module.module_id,
          title: module.title,
          content: module.content,
          order: module.order,
          course: {
            course_id: module.course_id,
            title: module.$extras.course_title,
            description: module.$extras.course_description,
            teacher: {
              user_id: module.$extras.teacher_id,
              last_name: module.$extras.teacher_last_name, 
              first_name: module.$extras.teacher_first_name, 
              middle_name: module.$extras.teacher_middle_name, 
              email: module.$extras.teacher_email,
              role: module.$extras.teacher_role,
            }
          },
          created_at: module.created_at,
          updated_at: module.updated_at
        }
      })
  
      return response.status(200).json(paginatedModulesJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении списка модулей.',
        error: error.message
      })
    }
  }

  /**
   * Create a new module
   */
  async create({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const data = request.only(['title', 'course_id', 'content'])

      try {
        await moduleValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
      
      const course = await Course.findOrFail(data.course_id)
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете добавлять модули только к своим курсам.'
        })
      }

      const existingModule = await Module.query()
        .where('title', data.title)
        .andWhere('course_id', data.course_id)
        .first()

      if (existingModule) {
        return response.status(400).json({
          message: 'Курс уже имеет модуль с таким названием.'
        })
      }

      const module = await Module.create(data)
      await module.save()

      const teacher = await User.findOrFail(course.teacher_id)

      return response.status(200).json({
        message: 'Модуль успешно создан!',
        module_id: module.module_id,
        title: module.title,
        content: module.content,
        course: {
          course_id: course.course_id,
          title: course.title,
          description: course.description,
          teacher: {
            user_id: teacher.user_id,
            last_name: teacher.last_name,
            first_name: teacher.first_name,
            middle_name: teacher.middle_name,
            email: teacher.email,
            role: teacher.role,
          }
        },
        created_at: module.created_at,
        updated_at: module.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого курса не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при создании модуля.',
        error: error.message
      })
    }
  }

  /**
   * Show individual module 
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const module = await Module
        .query()
        .where('modules.module_id', params.id)
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
        .select(
          'modules.module_id',
          'modules.title',
          'modules.content',
          'modules.order',
          'modules.created_at',
          'modules.updated_at',
          'courses.course_id',
          'courses.title as course_title',
          'courses.description as course_description',
          'courses.teacher_id as course_teacher_id', 
          'teachers.user_id as teacher_id',
          'teachers.first_name as teacher_first_name',
          'teachers.last_name as teacher_last_name',
          'teachers.middle_name as teacher_middle_name',
          'teachers.email as teacher_email',
          'teachers.role as teacher_role'
        )
        .first()
  
      if (!module) {
        throw { status: 404, message: 'Такого модуля не существует!' }
      }
  
      if (user.role === 'teacher') {
        if (module.$extras.course_teacher_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просматривать только модули своих курсов.'
          }
        }
      } else if (user.role === 'student') {
        const enrollment = await Enrollment
          .query()
          .where('course_id', module.course_id)
          .andWhere('student_id', user.user_id)
          .first()
  
        if (!enrollment) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просматривать только модули курсов, на которые записаны.'
          }
        }
      }
  
      return response.status(200).json({
        module_id: module.module_id,
        title: module.title,
        content: module.content,
        course: {
          course_id: module.course_id,
          title: module.$extras.course_title,
          description: module.$extras.course_description,
          teacher: {
            user_id: module.$extras.teacher_id,
            last_name: module.$extras.teacher_last_name, 
            first_name: module.$extras.teacher_first_name, 
            middle_name: module.$extras.teacher_middle_name, 
            email: module.$extras.teacher_email,
            role: module.$extras.teacher_role,
          }
        },
        created_at: module.created_at,
        updated_at: module.updated_at
      })
  
    } catch (error) {
      if (error.status) {
        return response.status(error.status).json({ message: error.message })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при получении данных о модуле.',
        error: error.message
      })
    }
  }

  /**
   * Update module
   */
  async update({ auth, request, response, params }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const moduleId = params.id

      const data = request.only(['title', 'course_id', 'content'])

      try {
        await moduleValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }

      const module = await Module.findOrFail(moduleId)

      const course = await Course.findOrFail(data.course_id)
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете обновлять модули только своих курсов.'
        })
      }

      const existingModule = await Module.query()
        .where('title', data.title)
        .andWhere('course_id', data.course_id)
        .andWhereNot('module_id', moduleId)
        .first()

      if (existingModule) {
        return response.status(400).json({
          message: 'Курс уже имеет модуль с таким названием.'
        })
      }

      module.title = data.title
      module.course_id = data.course_id
      module.content = data.content
 
      await module.save()

      const teacher = await User.findOrFail(course.teacher_id)

      return response.status(200).json({
        message: 'Модуль успешно обновлен!',
        module_id: module.module_id,
        title: module.title,
        content: module.content,
        course: {
          course_id: course.course_id,
          title: course.title,
          description: course.description,
          teacher: {
            user_id: teacher.user_id,
            last_name: teacher.last_name,
            first_name: teacher.first_name,
            middle_name: teacher.middle_name,
            email: teacher.email,
            role: teacher.role,
          }
        },
        created_at: module.created_at,
        updated_at: module.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Модуль не найден!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении модуля.',
        error: error.message
      })
    }
  }

  /**
   * Delete module
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const module = await Module.findOrFail(params.id)
      
      const course = await Course.findOrFail(module.course_id)
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять модули только своих курсов.'
        })
      }

      await module.delete()
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого модуля не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении модуля.',
        error: error.message
      })
    }
  }
}