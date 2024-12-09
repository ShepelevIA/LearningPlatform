import type { HttpContext } from '@adonisjs/core/http'
import Progress from '#models/progress'
import User from '#models/user'
import Module from '#models/module'
import Course from '#models/course'
import Enrollment from '#models/enrollment'

export default class ProgressController {
  /**
   * Display a list of progress
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
  
      let query = Progress
        .query()
        .innerJoin('users as students', 'progresses.student_id', 'students.user_id')
        .innerJoin('modules', 'progresses.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
  
      if (user.role === 'student') {
        query = query.where('progresses.student_id', user.user_id)
      } else if (user.role === 'teacher') {
        query = query.where('courses.teacher_id', user.user_id)
      }
  
      const paginatedProgresses = await query
        .select(
          'progresses.progress_id',
          'progresses.status',
          'progresses.created_at',
          'progresses.updated_at',
          'students.user_id as student_id',
          'students.first_name as teacher_first_name',
          'students.last_name as teacher_last_name',
          'students.middle_name as teacher_middle_name',
          'students.email as student_email',
          'students.role as student_role',
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
  
      const paginatedProgressesJson = paginatedProgresses.toJSON()
      paginatedProgressesJson.data = paginatedProgressesJson.data.map(progress => {
        return {
          progress_id: progress.progress_id,
          status: progress.status,
          student: {
            student_id: progress.student_id,
            first_name: progress.$extras.students_first_name,
            last_name: progress.$extras.students_last_name,
            middle_name: progress.$extras.students_middle_name,
            email: progress.$extras.student_email,
            role: progress.$extras.student_role
          },
          module: {
            module_id: progress.module_id,
            title: progress.$extras.module_title,
            content: progress.$extras.module_content,
            order: progress.$extras.module_order,
            course: {
              course_id: progress.$extras.course_id,
              title: progress.$extras.course_title,
              description: progress.$extras.course_description,
              teacher: {
                teacher_id: progress.$extras.teacher_id,
                first_name: progress.$extras.teacher_first_name,
                last_name: progress.$extras.teacher_last_name,
                middle_name: progress.$extras.teacher_middle_name,
                email: progress.$extras.teacher_email,
                role: progress.$extras.teacher_role
              }
            }
          },
          created_at: progress.created_at,
          updated_at: progress.updated_at
        }
      })
  
      return response.status(200).json(paginatedProgressesJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении прогресса по курсам.',
        error: error.message
      })
    }
  }

  /**
   * Create a new progress
   */
  async create({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data = request.only(['student_id', 'module_id', 'status'])
  
      const student = await User.findOrFail(data.student_id)
      if (student.role !== 'student') {
        return response.status(400).json({ message: 'Указанный пользователь не является студентом' })
      }
  
      const module = await Module.findOrFail(data.module_id)
      const course = await Course.findOrFail(module.course_id)


      if (user.role === 'admin') {
  
      const enrollment = await Enrollment.query()
        .where('student_id', data.student_id)
        .andWhere('course_id', module.course_id)
        .first()
  
      if (!enrollment) {
        return response.status(403).json({
          message: 'Студент не записан на данный курс или модуль.'
        })
      }
    } else if (user.role === 'student') {

        if (user.user_id !== Number(data.student_id)) {
          return response.status(403).json({
            message: 'Доступ запрещен. Студенты могут создавать прогресс только для себя.'
          })
        }

        const studentEnrollment = await Enrollment.query()
        .where('student_id', data.student_id)
        .andWhere('course_id', course.course_id)
        .first()

      if (!studentEnrollment) {
        return response.status(403).json({
          message: 'Студент не записан на этот курс.'
        })
      }
      } else if (user.role === 'teacher') {

        if (course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете создавать прогресс только для студентов своих курсов.'
          })
        }

        const teacherEnrollment = await Enrollment.query()
          .where('student_id', data.student_id)
          .andWhere('course_id', course.course_id)
          .first()
  
        if (!teacherEnrollment) {
          return response.status(403).json({
            message: 'Студент не записан на ваш курс.'
          })
        }
      }
  
      const existingProgress = await Progress.query()
        .where('student_id', data.student_id)
        .andWhere('module_id', data.module_id)
        .first()
  
      if (existingProgress) {
        return response.status(400).json({
          message: 'Прогресс по данному модулю для этого студента уже существует.'
        })
      }
  
      const progress = await Progress.create(data)
      await progress.save()
  
      const teacher = await User.findOrFail(course.teacher_id)
  
      return response.status(201).json({
        message: 'Прогресс успешно создан!',
        progress_id: progress.progress_id,
        status: progress.status,
        student: {
          student_id: student.user_id,
          last_name: student.last_name,
          first_name: student.first_name,
          middle_name: student.middle_name,
          email: student.email,
          role: student.role
        },
        module: {
          module_id: module.module_id,
          title: module.title,
          content: module.content,
          order: module.order,
          course: {
            course_id: course.course_id,
            title: course.title,
            description: course.description,
            teacher: {
              teacher_id: teacher.user_id,
              last_name: teacher.last_name,
              first_name: teacher.first_name,
              middle_name: teacher.middle_name,
              email: teacher.email,
              role: teacher.role
            }
          }
        },
        created_at: progress.created_at,
        updated_at: progress.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого студента или модуля не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при создании прогресса.',
        error: error.message
      })
    }
  }

  /**
   * Show individual progress
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const progress = await Progress
        .query()
        .where('progresses.progress_id', params.id)
        .innerJoin('users as students', 'progresses.student_id', 'students.user_id')
        .innerJoin('modules', 'progresses.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
        .select(
          'progresses.progress_id',
          'progresses.status',
          'progresses.created_at',
          'progresses.updated_at',
          'students.user_id as student_id',
          'students.first_name as teacher_first_name',
          'students.last_name as teacher_last_name',
          'students.middle_name as teacher_middle_name',
          'students.email as student_email',
          'students.role as student_role',
          'modules.module_id',
          'modules.title as module_title',
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
        .first()
  
      if (!progress) {
        throw { status: 404, message: 'Такого прогресса не существует!' }
      }
  
      if (user.role === 'teacher') {
        if (progress.$extras.teacher_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещен. Вы можете просматривать только прогресс студентов из ваших модулей.'
          }
        }
      } else if (user.role === 'student') {
        if (progress.student_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещен. Вы можете просматривать только свой прогресс.'
          }
        }
      } else if (user.role !== 'admin') {
        throw {
          status: 403,
          message: 'Доступ запрещен. У вас нет прав для просмотра этого прогресса.'
        }
      }
  
      return response.status(200).json({
        progress_id: progress.progress_id,
        status: progress.status,
        student: {
          student_id: progress.student_id,
          first_name: progress.$extras.students_first_name,
          last_name: progress.$extras.students_last_name,
          middle_name: progress.$extras.students_middle_name,
          email: progress.$extras.student_email,
          role: progress.$extras.student_role
        },
        module: {
          module_id: progress.module_id,
          title: progress.$extras.module_title,
          order: progress.$extras.module_order,
          course: {
            course_id: progress.$extras.course_id,
            title: progress.$extras.course_title,
            description: progress.$extras.course_description,
            teacher: {
              teacher_id: progress.$extras.teacher_id,
              first_name: progress.$extras.teacher_first_name,
              last_name: progress.$extras.teacher_last_name,
              middle_name: progress.$extras.teacher_middle_name,
              email: progress.$extras.teacher_email,
              role: progress.$extras.teacher_role
            }
          }
        },
        created_at: progress.created_at,
        updated_at: progress.updated_at
      })
    } catch (error) {
      if (error.status) {
        return response.status(error.status).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при получении данных о прогрессе.',
        error: error.message
      })
    }
  }

  /**
   * Update progress
   */
  async update({ auth, request, params, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const data = request.only(['status'])

      const progress = await Progress.findOrFail(params.id)

      const module = await Module.findOrFail(progress.module_id)
      const course = await Course.findOrFail(module.course_id)

      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете обновлять прогресс только своих студентов.'
        })
      }

      progress.status = data.status
      await progress.save()

      const student = await User.findOrFail(progress.student_id)
      const teacher = await User.findOrFail(course.teacher_id)

      return response.status(200).json({
        message: 'Прогресс успешно обновлен!',
        progress_id: progress.progress_id,
        status: progress.status,
        student: {
          student_id: student.user_id,
          last_name: student.last_name,
          first_name: student.first_name,
          middle_name: student.middle_name,
          email: student.email,
          role: student.role
        },
        module: {
          module_id: module.module_id,
          title: module.title,
          order: module.order,
          course: {
            course_id: course.course_id,
            title: course.title,
            description: course.description,
            teacher: {
              teacher_id: teacher.user_id,
              last_name: teacher.last_name,
              first_name: teacher.first_name,
              middle_name: teacher.middle_name,
              email: teacher.email,
              role: teacher.role
            }
          }
        },
        created_at: progress.created_at,
        updated_at: progress.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Прогресс не найден!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении прогресса.',
        error: error.message
      })
    }
  }

  /**
   * Delete progress
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const progress = await Progress.findOrFail(params.id)

      const module = await Module.findOrFail(progress.module_id)
      const course = await Course.findOrFail(module.course_id)

      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять прогресс только своих студентов.'
        })
      }

      await progress.delete()
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого прогресса не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении прогресса.',
        error: error.message
      })
    }
  }
}
