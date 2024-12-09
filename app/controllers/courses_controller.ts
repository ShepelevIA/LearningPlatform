import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import User from '#models/user'
import Enrollment from '#models/enrollment'

export default class CoursesController {
  /**
   * Display a list of resource
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const showAll = request.input('all') !== undefined
  
      let query = Course.query().innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
  
      if (!showAll) {
        if (user.role === 'student') {
          query = query
            .innerJoin('enrollments', 'courses.course_id', 'enrollments.course_id')
            .where('enrollments.student_id', user.user_id)
        } else if (user.role === 'teacher') {
          query = query.where('courses.teacher_id', user.user_id)
        }
      }
  
      const paginatedCourses = await query
        .select(
          'courses.course_id',
          'courses.title',
          'courses.description',
          'courses.created_at',
          'courses.updated_at',
          'teachers.user_id as teacher_id',
          'teachers.name as teacher_name',
          'teachers.email as teacher_email',
          'teachers.role as teacher_role'
        )
        .paginate(page, limit)
  
      const paginatedCoursesJson = paginatedCourses.toJSON()
      paginatedCoursesJson.data = paginatedCoursesJson.data.map(course => {
        return {
          course_id: course.course_id,
          title: course.title,
          description: course.description,
          teacher: {
            teacher_id: course.teacher_id,
            name: course.$extras.teacher_name,
            email: course.$extras.teacher_email,
            role: course.$extras.teacher_role,
          },
          created_at: course.created_at,
          updated_at: course.updated_at,
        }
      })
  
      return response.status(200).json(paginatedCoursesJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении списка курсов.',
        error: error.message,
      })
    }
  }

  /**
   * Display form to create a new record
   */
  async create({ request, response, auth }: HttpContext) {
    try {

      const user = auth.user
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const data = request.only(['title', 'description', 'teacher_id'])

      if (user.role === 'teacher' && user.user_id != data.teacher_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете создавать записи только под своим аккаунтом.'
        })
      }

      const existingCourse = await Course.query()
        .where('title', data.title)
        .andWhere('teacher_id', data.teacher_id)
        .first()
  
      if (existingCourse) {
        return response.status(400).json({
          message: 'Преподаватель уже имеет курс с таким названием.'
        })
      }

      const teacher = await User.findOrFail(data.teacher_id)
  
      const course = await Course.create(data)
      await course.save()
  
      return response.status(201).json({
        message: 'Курс успешно создан!',
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
        },
        created_at: course.created_at,
        updated_at: course.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого преподавателя не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при создании курса.',
        error: error.message
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const courseQuery = Course
        .query()
        .where('courses.course_id', params.id)
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
        .select(
          'courses.course_id',
          'courses.title',
          'courses.description',
          'courses.created_at',
          'courses.updated_at',
          'teachers.user_id as teacher_id',
          'teachers.name as teacher_name',
          'teachers.email as teacher_email',
          'teachers.role as teacher_role'
        )
  
        const course = await courseQuery.firstOrFail()

        if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещён. Вы можете просмотреть курс, только если вы автор курса.'
          })
        }
    
        if (user.role === 'student') {
          const enrollment = await Enrollment
            .query()
            .where('course_id', params.id)
            .andWhere('student_id', user.user_id)
            .first()
    
          if (!enrollment) {
            return response.status(403).json({
              message: 'Доступ запрещён. Вы можете просмотреть курс, только если вы записаны на этот курс.'
            })
          }
        }
  
      return response.status(200).json({
        course_id: course.course_id,
        title: course.title,
        description: course.description,
        teacher: {
          teacher_id: course.teacher_id,
          name: course.$extras.teacher_name,
          email: course.$extras.teacher_email,
          role: course.$extras.teacher_role
        },
        created_at: course.created_at,
        updated_at: course.updated_at
      })
  
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого курса не существует!',
        })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при получении данных о курсе.',
        error: error.message
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data = request.only(['title', 'description', 'teacher_id'])
  
      const course = await Course.findOrFail(params.id)
  
      if (user.role === 'teacher') {
        if (course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете обновлять только свои курсы.'
          })
        }
        if (data.teacher_id && Number(data.teacher_id) !== user.user_id) {
          return response.status(403).json({
            message: 'Вы не можете изменить преподавателя курса.'
          })
        }
      }
  
      const existingCourse = await Course.query()
        .where('title', data.title)
        .andWhere('teacher_id', data.teacher_id || course.teacher_id)
        .andWhereNot('course_id', course.course_id)
        .first()
  
      if (existingCourse) {
        return response.status(400).json({
          message: 'Преподаватель уже имеет курс с таким названием.'
        })
      }
  
      course.title = data.title
      course.description = data.description
  
      if (user.role === 'admin' && data.teacher_id) {
        course.teacher_id = data.teacher_id
      }
  
      await course.save()
  
      const teacher = await User.findOrFail(course.teacher_id)
  
      return response.status(200).json({
        message: 'Данные курса успешно обновлены!',
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
        },
        created_at: course.created_at,
        updated_at: course.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого курса или преподавателя не существует!',
        })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении данных курса.',
        error: error.message
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const course = await Course.findOrFail(params.id)
  
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять только свои курсы.'
        })
      }
  
      await course.delete()
  
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого курса не существует!',
        })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при удалении курса.',
        error: error.message
      })
    }
  }
}
