import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import Module from '#models/module'
import Course from '#models/course'
import Enrollment from '#models/enrollment'

import { createAssignmentsValidator, updateAssignmentsValidator } from '#validators/assignment'

export default class AssignmentsController {
  /**
   * Display a list of assignments with files
   */
  async index({ auth, request, response }: HttpContext) {
    try { 
      const user = auth.user
    
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
    
      let query = Assignment
        .query()
        .innerJoin('modules', 'assignments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
    
      if (user.role === 'student') {
        query = query
          .innerJoin('enrollments', 'courses.course_id', 'enrollments.course_id')
          .where('enrollments.student_id', user.user_id)
      } else if (user.role === 'teacher') {
        query = query.where('courses.teacher_id', user.user_id)
      }
    
      const paginatedAssignments = await query
      .select(
        'assignments.assignment_id',
        'assignments.title',
        'assignments.description',
        'assignments.due_date',
        'assignments.created_at',
        'assignments.updated_at',
        'modules.module_id',
        'modules.title as module_title',
        'modules.content as module_content',
        'modules.order as module_order',
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
  
      const paginatedAssignmentsJson = paginatedAssignments.toJSON()

      paginatedAssignmentsJson.data = paginatedAssignmentsJson.data.map(assignment => {
        return {
          assignment_id: assignment.assignment_id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          module: {
            module_id: assignment.module_id,
            title: assignment.$extras.module_title,
            content: assignment.$extras.module_content,
            order: assignment.$extras.module_order,
            course: {
              course_id: assignment.$extras.course_id,
              title: assignment.$extras.course_title,
              description: assignment.$extras.course_description,
              teacher: {
                teacher_id: assignment.$extras.teacher_id,
                last_name: assignment.$extras.teacher_last_name, 
                first_name: assignment.$extras.teacher_first_name, 
                middle_name: assignment.$extras.teacher_middle_name, 
                email: assignment.$extras.teacher_email,
                role: assignment.$extras.teacher_role
              }
            }
          },
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
        }
      })

      const resource_id = paginatedAssignmentsJson.data.map(assignment => assignment.assignment_id)
    
      return response.status(200).json({
        paginatedAssignmentsJson,
        file_filters: {
          resource_id
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении списка заданий.',
        error: error.message
      })
    }
  }

  /**
   * Create a new assignment and optionally attach a file
   */
  async create({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user
    
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
    
      const data = request.only(['module_id', 'title', 'description', 'due_date'])

      try {
        await createAssignmentsValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
    
      const module = await Module.findOrFail(data.module_id)
      const course = await Course.findOrFail(module.course_id)
    
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете добавлять задания только к своим курсам.'
        })
      }
  
      const existingAssignment = await Assignment.query()
        .where('module_id', data.module_id)
        .andWhere('title', data.title)
        .first()
    
      if (existingAssignment) {
        return response.status(400).json({
          message: 'Задание с таким названием уже существует в данном модуле.'
        })
      }
    
      const assignment = await Assignment.create({
        module_id: data.module_id,
        title: data.title,
        description: data.description,
      })
    
      await assignment.save()
    
      return response.status(201).json({
        message: 'Задание успешно создано!',
        assignment_id: assignment.assignment_id,
        title: assignment.title,
        description: assignment.description,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при создании задания.',
        error: error.message
      })
    }
  }

  /**
   * Show individual assignment with files
   */
  async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const assignment = await Assignment
        .query()
        .where('assignments.assignment_id', params.id)
        .innerJoin('modules', 'assignments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
        .select(
          'assignments.assignment_id',
          'assignments.title',
          'assignments.description',
          'assignments.due_date',
          'assignments.created_at',
          'assignments.updated_at',
          'modules.module_id',
          'modules.title as module_title',
          'modules.content as module_content',
          'modules.order as module_order',
          'courses.course_id',
          'courses.title as course_title',
          'courses.description as course_description',
          'teachers.user_id as teacher_id',
          'teachers.name as teacher_name',
          'teachers.email as teacher_email',
          'teachers.role as teacher_role'
        )
        .first()
  
      if (!assignment) {
        throw { status: 404, message: 'Такого задания не существует!' }
      }
  
      if (user.role === 'student') {
        const enrollment = await Enrollment
          .query()
          .where('course_id', assignment.$extras.course_id)
          .andWhere('student_id', user.user_id)
          .first()
  
        if (!enrollment) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просматривать только задания курсов, на которые вы записаны.'
          }
        }
      } else if (user.role === 'teacher') {
        if (assignment.$extras.teacher_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просматривать только задания из ваших курсов.'
          }
        }
      } else if (user.role !== 'admin') {
        throw {
          status: 403,
          message: 'Доступ запрещён. У вас нет прав для просмотра этого задания.'
        }
      }

      const assignmentInstance = new Assignment()
      assignmentInstance.assignment_id = assignment.assignment_id
  
      return response.status(200).json({
        assignment_id: assignment.assignment_id,
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.due_date,
        module: {
          module_id: assignment.module_id,
          title: assignment.$extras.module_title,
          content: assignment.$extras.module_content,
          order: assignment.$extras.module_order,
          course: {
            course_id: assignment.$extras.course_id,
            title: assignment.$extras.course_title,
            description: assignment.$extras.course_description,
            teacher: {
              teacher_id: assignment.$extras.teacher_id,
              name: assignment.$extras.teacher_name,
              email: assignment.$extras.teacher_email,
              role: assignment.$extras.teacher_role
            }
          }
        },
        created_at: assignment.created_at,
        updated_at: assignment.updated_at
      })
    } catch (error) {
      if (error.status) {
        return response.status(error.status).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при получении задания.',
        error: error.message
      })
    }
  }

  /**
   * Update assignment and optionally attach a file
   */
  async update({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data = request.only(['title', 'description', 'due_date', 'module_id'])

      try {
        await updateAssignmentsValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
  
      const assignment = await Assignment.findOrFail(params.id)
  
      if (user.role === 'teacher') {
        const module = await Module.findOrFail(assignment.module_id)
        const course = await Course.findOrFail(module.course_id)
  
        if (course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете обновлять задания только для своих курсов.'
          })
        }
  
        if (data.module_id && data.module_id !== assignment.module_id) {
          const newModule = await Module.findOrFail(data.module_id)
          const newCourse = await Course.findOrFail(newModule.course_id)
  
          if (newCourse.teacher_id !== user.user_id) {
            return response.status(403).json({
              message: 'Доступ запрещен. Вы можете обновлять задания только в модули своих курсов.'
            })
          }
        }
      }
  
      const existingAssignment = await Assignment.query()
        .where('module_id', data.module_id || assignment.module_id)
        .andWhere('title', data.title)
        .andWhereNot('assignment_id', params.id)
        .first()
  
      if (existingAssignment) {
        return response.status(400).json({
          message: 'Задание с таким названием уже существует в данном модуле.'
        })
      }
  
      if (data.module_id && data.module_id !== assignment.module_id) {
        assignment.module_id = data.module_id
      }
  
      assignment.title = data.title
  
      await assignment.save()
  
      return response.status(200).json({
        message: 'Задание успешно обновлено!',
        assignment_id: assignment.assignment_id,
        title: assignment.title,
        description: data.description|| assignment.description,
        updated_at: assignment.updated_at,
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Задание или модуль не найдено!'
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении задания.',
        error: error.message
      })
    }
  }

  /**
   * Delete assignment and its files
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const assignment = await Assignment.findOrFail(params.id)
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)
  
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять задания только для своих курсов.'
        })
      }
  
      await assignment.delete()
  
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Задание не найдено!'
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении задания.',
        error: error.message
      })
    }
  }
}