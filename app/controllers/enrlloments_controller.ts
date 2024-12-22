import type { HttpContext } from '@adonisjs/core/http'
import Enrollment from '#models/enrollment'
import User from '#models/user'
import Course from '#models/course'

import { enrllomentsValidator } from '#validators/enrlloment'

export default class EnrollmentsController {
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
  
      let query = Enrollment
        .query()
        .innerJoin('users as students', 'enrollments.student_id', 'students.user_id')
        .innerJoin('courses', 'enrollments.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
  
      if (user.role === 'student') {
        query = query.where('enrollments.student_id', user.user_id)
      } else if (user.role === 'teacher') {
        query = query.where('courses.teacher_id', user.user_id)
      }
  
      const paginatedEnrollments = await query
        .select(
          'enrollments.enrollment_id',
          'enrollments.created_at',
          'enrollments.updated_at',
          'students.user_id as student_id',
          'students.first_name as students_first_name',
          'students.last_name as students_last_name',
          'students.middle_name as students_middle_name',
          'students.email as student_email',
          'students.role as student_role',
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
  
      const paginatedEnrollmentsJson = paginatedEnrollments.toJSON()
      paginatedEnrollmentsJson.data = paginatedEnrollmentsJson.data.map(enrollment => {
        return {
          enrollment_id: enrollment.enrollment_id,
          student: {
            id_student: enrollment.student_id,
            name: enrollment.$extras.student_name,
            first_name: enrollment.$extras.students_first_name,
            last_name: enrollment.$extras.students_last_name,
            middle_name: enrollment.$extras.students_middle_name,
            email: enrollment.$extras.student_email,
            role: enrollment.$extras.student_role
          },
          course: {
            course_id: enrollment.course_id,
            title: enrollment.$extras.course_title,
            description: enrollment.$extras.course_description,
            teacher: {
              teacher_id: enrollment.$extras.teacher_id,
              first_name: enrollment.$extras.teacher_first_name,
              last_name: enrollment.$extras.teacher_last_name,
              middle_name: enrollment.$extras.teacher_middle_name,
              email: enrollment.$extras.teacher_email,
              role: enrollment.$extras.teacher_role
            }
          },
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at
        }
      })
  
      return response.status(200).json(paginatedEnrollmentsJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении списка с записями на курсы.',
        error: error.message
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

      const data = request.only(['student_id', 'course_id'])

      try {
        await enrllomentsValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }

      if (user.role === 'student' && user.user_id != data.student_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете записатся на курс только под своим аккаунтом.'
        })
      }
  
      const existingEnrollment = await Enrollment.query()
        .where('student_id', data.student_id)
        .andWhere('course_id', data.course_id)
        .first()
  
      if (existingEnrollment) {
        return response.status(400).json({
          message: 'Студент уже записан на этот курс.'
        })
      }

      const course: Course = await Course.findOrFail(data.course_id)
      const student: User = await User.findOrFail(data.student_id)
      const teacher: User = await User.findOrFail(course.teacher_id)
  
      const enrollment = await Enrollment.create(data)
      await enrollment.save()
  
      return response.status(201).json({
        message: 'Запись на курс прошла успешно!',
        enrollment_id: enrollment.enrollment_id,
        student: {
          id_student: student.user_id,
          last_name: student.last_name,
          first_name: student.first_name,
          middle_name: student.middle_name,
          email: student.email,
          role: student.role
        },
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
        },
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого студента или курса не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при записи на курс.',
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
  
      const baseEnrollmentQuery = Enrollment
        .query()
        .where('enrollments.enrollment_id', params.id)
        .innerJoin('users as students', 'enrollments.student_id', 'students.user_id')
        .innerJoin('courses', 'enrollments.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
        .select(
          'enrollments.enrollment_id',
          'enrollments.created_at',
          'enrollments.updated_at',
          'students.user_id as student_id',
          'students.first_name as teacher_first_name',
          'students.last_name as teacher_last_name',
          'students.middle_name as teacher_middle_name',
          'students.email as student_email',
          'students.role as student_role',
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
  
      const enrollment = await baseEnrollmentQuery.first()
  
      if (!enrollment) {
        throw { status: 404, message: 'Такой записи на курс не существует!' }
      }
  
      if (user.role === 'teacher') {
        if (enrollment.$extras.teacher_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просмотреть записи студента на курс, только если вы автор курса.'
          }
        }
      } else if (user.role === 'student') {
        if (enrollment.student_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просмотреть запись на курс только на тот, на который записаны.'
          }
        }
      }
  
      return response.status(200).json({
        enrollment_id: enrollment.enrollment_id,
        student: {
          id_student: enrollment.student_id,
          first_name: enrollment.$extras.students_first_name,
          last_name: enrollment.$extras.students_last_name,
          middle_name: enrollment.$extras.students_middle_name,
          email: enrollment.$extras.student_email,
          role: enrollment.$extras.student_role
        },
        course: {
          course_id: enrollment.course_id,
          title: enrollment.$extras.course_title,
          description: enrollment.$extras.course_description,
          teacher: {
            teacher_id: enrollment.$extras.teacher_id,
            first_name: enrollment.$extras.teacher_first_name,
            last_name: enrollment.$extras.teacher_last_name,
            middle_name: enrollment.$extras.teacher_middle_name,
            email: enrollment.$extras.teacher_email,
            role: enrollment.$extras.teacher_role
          }
        },
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at
      })
  
    } catch (error) {
      if (error.status) {
        return response.status(error.status).json({ message: error.message })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при получении данных о записи на курс.',
        error: error.message
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, request, response, params }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data: { student_id?: number; course_id: number } = request.only(['student_id', 'course_id'])
  
      try {
        await enrllomentsValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
  
      const enrollmentId = params.id
  
      const enrollment = await Enrollment.findOrFail(enrollmentId)
  
      if (user.role === 'teacher') {
        const teacherCourse = await Course.query()
          .where('course_id', enrollment.course_id)
          .andWhere('teacher_id', user.user_id)
          .first()
  
        if (!teacherCourse) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете обновлять только записи своих студентов.',
          })
        }
  
        if (data.student_id && data.student_id !== enrollment.student_id) {
          const isStudentInCourse = await Enrollment.query()
            .where('student_id', data.student_id)
            .andWhere('course_id', data.course_id)
            .first()
  
          if (!isStudentInCourse) {
            return response.status(403).json({
              message: 'Доступ запрещен. Указанный студент не записан на ваш курс.',
            })
          }
        }
      }
  
      if (user.role === 'admin' && data.student_id && data.student_id !== enrollment.student_id) {
        const existingEnrollment = await Enrollment.query()
          .where('student_id', data.student_id)
          .andWhere('course_id', data.course_id)
          .first()
  
        if (existingEnrollment) {
          return response.status(400).json({
            message: 'Студент уже записан на этот курс.',
          })
        }
  
        enrollment.student_id = data.student_id
      }
  
      const existingEnrollment = await Enrollment.query()
        .where('student_id', enrollment.student_id)
        .andWhere('course_id', data.course_id)
        .andWhereNot('enrollment_id', enrollmentId)
        .first()
  
      if (existingEnrollment) {
        return response.status(400).json({
          message: 'Студент уже записан на этот курс.',
        })
      }
  
      enrollment.course_id = data.course_id
  
      const updatedCourse = await Course.findOrFail(data.course_id)
      const teacher = await User.findOrFail(updatedCourse.teacher_id)
      const student = await User.findOrFail(enrollment.student_id)
  
      await enrollment.save()
  
      return response.status(200).json({
        message: 'Данные записи успешно обновлены!',
        enrollment_id: enrollment.enrollment_id,
        student: {
          id_student: student.user_id,
          last_name: student.last_name,
          first_name: student.first_name,
          middle_name: student.middle_name,
          email: student.email,
          role: student.role,
        },
        course: {
          course_id: updatedCourse.course_id,
          title: updatedCourse.title,
          description: updatedCourse.description,
          teacher: {
            teacher_id: teacher.user_id,
            last_name: teacher.last_name,
            first_name: teacher.first_name,
            middle_name: teacher.middle_name,
            email: teacher.email,
            role: teacher.role,
          },
        },
        created_at: enrollment.created_at,
        updated_at: enrollment.updated_at,
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Запись на курс или данные о курсе не найдены!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении записи на курс.',
        error: error.message,
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
  
      const enrollment = await Enrollment.findOrFail(params.id)
  
      if (user.role === 'student' && enrollment.student_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять только свои записи.',
        })
      }
  
      if (user.role === 'teacher') {
        const teacherCourse = await Course.query()
          .where('course_id', enrollment.course_id)
          .andWhere('teacher_id', user.user_id)
          .first()
  
        if (!teacherCourse) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете удалять только записи студентов, которые записаны на ваши курсы.',
          })
        }
      }
  
      await enrollment.delete()
  
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такой записи на курс не существует!',
        })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при удалении записи на курс.',
        error: error.message,
      })
    }
  }
}