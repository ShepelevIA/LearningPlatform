import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import Module from '#models/module'
import Enrollment from '#models/enrollment'
import Course from '#models/course'

import { createCommentsValidator, updateCommentsValidator } from '#validators/comment'

export default class CommentsController {
  /**
   * Display a list of comments
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
  
      let query = Comment
        .query()
        .distinct()
        .innerJoin('modules', 'comments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users', 'comments.user_id', 'users.user_id')
  
      if (user.role === 'student') {
        query = query
          .innerJoin('enrollments', 'courses.course_id', 'enrollments.course_id')
          .where('enrollments.student_id', user.user_id)
          .andWhere('comments.user_id', user.user_id)
      } else if (user.role === 'teacher') {
        query = query.where('courses.teacher_id', user.user_id)
      }
  
      const paginatedComments = await query
        .select(
          'comments.comment_id',
          'comments.content',
          'comments.created_at',
          'comments.updated_at',
          'modules.module_id',
          'modules.title as module_title',
          'modules.content as module_content',
          'modules.order as module_order',
          'users.user_id',
          'users.first_name as teacher_first_name',
          'users.last_name as teacher_last_name',
          'users.middle_name as teacher_middle_name',
          'users.email as user_email',
          'users.role as user_role'
        )
        .paginate(page, limit)
  
      const paginatedCommentsJson = paginatedComments.toJSON()
      paginatedCommentsJson.data = paginatedCommentsJson.data.map(comment => {
        return {
          comment_id: comment.comment_id,
          content: comment.content,
          module: {
            module_id: comment.module_id,
            title: comment.$extras.module_title,
            content: comment.$extras.module_content,
            order: comment.$extras.module_order
          },
          user: {
            user_id: comment.user_id,
            last_name: comment.$extras.teacher_last_name, 
            first_name: comment.$extras.teacher_first_name, 
            middle_name: comment.$extras.teacher_middle_name, 
            email: comment.$extras.user_email,
            role: comment.$extras.user_role
          },
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }
      })
  
      return response.status(200).json(paginatedCommentsJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении комментариев.',
        error: error.message
      })
    }
  }

  /**
   * Create a new comment
   */
  async create({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data = request.only(['module_id', 'content'])

      try {
        await createCommentsValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
  
      const module = await Module.query().where('module_id', data.module_id).first()
      if (!module) {
        return response.status(404).json({ message: 'Модуль не найден!' })
      }
  
      const course = await Course.query().where('course_id', module.course_id).first()
      if (!course) {
        return response.status(404).json({ message: 'Курс не найден!' })
      }
  
      if (user.role !== 'admin') {
        if (user.role === 'student') {
          const enrollment = await Enrollment.query()
            .where('student_id', user.user_id)
            .andWhere('course_id', course.course_id)
            .first()
  
          if (!enrollment) {
            return response.status(403).json({
              message: 'Доступ запрещен. Вы можете оставлять комментарии только в курсах, на которые зачислены.',
            })
          }
        }
  
        if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете комментировать только модули своих курсов.',
          })
        }
      }
  
      const comment = await Comment.create({
        module_id: data.module_id,
        user_id: user.user_id,
        content: data.content,
      })
  
      return response.status(201).json({
        comment_id: comment.comment_id,
        content: comment.content,
        module: {
          module_id: module.module_id,
          title: module.title,
          content: module.content,
          order: module.order,
        },
        user: {
          user_id: user.user_id,
          last_name: user.last_name,
          first_name: user.first_name,
          middle_name: user.middle_name,
          email: user.email,
          role: user.role,
        },
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого модуля или пользователя не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при создании комментария.',
        error: error.message,
      })
    }
  }

    /**
   * Show individual comment
   */
    async show({ params, auth, response }: HttpContext) {
      try {
        const user = auth.user
    
        if (!user) {
          return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
        }
    
        const comment = await Comment
          .query()
          .where('comments.comment_id', params.id)
          .innerJoin('modules', 'comments.module_id', 'modules.module_id')
          .innerJoin('courses', 'modules.course_id', 'courses.course_id')
          .innerJoin('users', 'comments.user_id', 'users.user_id')
          .select(
            'comments.comment_id',
            'comments.content',
            'comments.created_at',
            'comments.updated_at',
            'modules.module_id',
            'modules.title as module_title',
            'modules.content as module_content',
            'modules.order as module_order',
            'users.user_id',
            'users.first_name as teacher_first_name',
            'users.last_name as teacher_last_name',
            'users.middle_name as teacher_middle_name',
            'users.email as user_email',
            'users.role as user_role',
            'courses.course_id as course_id',
            'courses.teacher_id as course_teacher_id'
          )
          .first()
    
        if (!comment) {
          throw { status: 404, message: 'Такого комментария не существует!' }
        }
    
        if (user.role === 'student') {

          if (comment.user_id !== user.user_id) {
            throw {
              status: 403,
              message: 'Доступ запрещён. Вы можете просмотреть только свой комментарий.'
            }
          }
    
          const enrollment = await Enrollment
            .query()
            .where('course_id', comment.$extras.course_id)
            .andWhere('student_id', user.user_id)
            .first()
    
          if (!enrollment) {
            throw {
              status: 403,
              message: 'Доступ запрещён. Вы не записаны на этот курс.'
            }
          }
        } else if (user.role === 'teacher') {

          if (comment.$extras.course_teacher_id !== user.user_id) {
            throw {
              status: 403,
              message: 'Доступ запрещён. Вы можете просмотреть только комментарии студентов из ваших модулей.'
            }
          }
        } else if (user.role !== 'admin') {

          throw {
            status: 403,
            message: 'Доступ запрещён. У вас нет прав для просмотра этого комментария.'
          }
        }

        const formattedComment = {
          comment_id: comment.comment_id,
          content: comment.content,
          module: {
            module_id: comment.module_id,
            title: comment.$extras.module_title,
            content: comment.$extras.module_content,
            order: comment.$extras.module_order
          },
          user: {
            user_id: comment.user_id,
            last_name: comment.$extras.teacher_last_name, 
            first_name: comment.$extras.teacher_first_name, 
            middle_name: comment.$extras.teacher_middle_name, 
            email: comment.$extras.user_email,
            role: comment.$extras.user_role
          },
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }
    
        return response.status(200).json(formattedComment)
      } catch (error) {
        if (error.status) {
          return response.status(error.status).json({ message: error.message })
        }
        return response.status(500).json({
          message: 'Произошла ошибка при получении комментария.',
          error: error.message
        })
      }
    }

  /**
   * Update comment
   */
  async update({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data = request.only(['content'])

      try {
        await updateCommentsValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
  
      const comment = await Comment.findOrFail(params.id)
  
      if (comment.user_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете обновлять только свои комментарии.'
        })
      }
  
      comment.content = data.content
      await comment.save()
  
      return response.status(200).json({
        message: 'Комментарий успешно обновлен!',
        comment_id: comment.comment_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Комментарий не найден!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении комментария.',
        error: error.message
      })
    }
  }

  /**
   * Delete comment
   */
  async destroy({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const comment = await Comment.findOrFail(params.id)
  
      if (user.role !== 'admin' && comment.user_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять только свои комментарии.'
        })
      }
  
      await comment.delete()
  
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Комментарий не найден!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении комментария.',
        error: error.message
      })
    }
  }
}