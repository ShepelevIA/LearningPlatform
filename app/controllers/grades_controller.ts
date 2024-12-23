import type { HttpContext } from '@adonisjs/core/http'
import Grade from '#models/grade'
import User from '#models/user'
import Assignment from '#models/assignment'
import Module from '#models/module'
import Course from '#models/course'
import Enrollment from '#models/enrollment'

import { createGradeValidator, updateGradeValidator } from '#validators/grade'

export default class GradesController {
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
  
      let query = Grade
        .query()
        .innerJoin('users as students', 'grades.student_id', 'students.user_id')
        .innerJoin('assignments', 'grades.assignment_id', 'assignments.assignment_id')
        .innerJoin('modules', 'assignments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
  
      if (user.role === 'student') {
        query = query.where('grades.student_id', user.user_id)
      } else if (user.role === 'teacher') {
        query = query.where('courses.teacher_id', user.user_id)
      }
  
      const paginatedGrades = await query
        .select(
          'grades.grade_id',
          'grades.grade',
          'grades.feedback',
          'grades.created_at',
          'grades.updated_at',
          'students.user_id as student_id',
          'students.name as student_name',
          'students.email as student_email',
          'students.role as student_role',
          'assignments.assignment_id',
          'assignments.title as assignment_title',
          'assignments.description as assignment_description',
          'assignments.due_date as assignment_due_date',
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
  
      const paginatedGradesJson = paginatedGrades.toJSON()
      paginatedGradesJson.data = paginatedGradesJson.data.map(grade => {
        return {
          grade_id: grade.grade_id,
          grade: grade.grade,
          feedback: grade.feedback,
          student: {
            student_id: grade.student_id,
            name: grade.$extras.student_name,
            email: grade.$extras.student_email,
            role: grade.$extras.student_role
          },
          assignment: {
            assignment_id: grade.assignment_id,
            title: grade.$extras.assignment_title,
            description: grade.$extras.assignment_description,
            due_date: grade.$extras.assignment_due_date,
            module: {
              module_id: grade.$extras.module_id,
              title: grade.$extras.module_title,
              content: grade.$extras.module_content,
              order: grade.$extras.module_order,
              course: {
                course_id: grade.$extras.course_id,
                title: grade.$extras.course_title,
                description: grade.$extras.course_description,
                teacher: {
                  teacher_id: grade.$extras.teacher_id,
                  first_name: grade.$extras.teacher_first_name,
                  last_name: grade.$extras.teacher_last_name,
                  middle_name: grade.$extras.teacher_middle_name,
                  email: grade.$extras.teacher_email,
                  role: grade.$extras.teacher_role
                }
              }
            }
          },
          created_at: grade.created_at,
          updated_at: grade.updated_at
        }
      })
  
      return response.status(200).json(paginatedGradesJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении списка оценок.',
        error: error.message
      })
    }
  }
  
  /**
   * Display form to create a new record
   */
  async create({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
    
      const data = request.only(['student_id', 'assignment_id', 'grade', 'feedback'])

      try {
        await createGradeValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
    
      const student = await User.findOrFail(data.student_id)
      const assignment = await Assignment.findOrFail(data.assignment_id)
    
      const existingGrade = await Grade.query()
        .where('student_id', data.student_id)
        .andWhere('assignment_id', data.assignment_id)
        .first()
    
      if (existingGrade) {
        return response.status(400).json({
          message: 'Оценка для этого студента по данному заданию уже существует.'
        })
      }
    
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)
      const teacher = await User.findOrFail(course.teacher_id)
    
      const enrollment = await Enrollment.query()
        .where('student_id', data.student_id)
        .andWhere('course_id', course.course_id)
        .first()
    
      if (!enrollment) {
        return response.status(403).json({
          message: 'Студент не зачислен на курс, связанный с данным заданием.',
        })
      }
    
      if (user.role === 'teacher') {
        if (course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете добавлять оценки только своим студентам.'
          })
        }
      }
    
      if (user.role !== 'admin' && user.role !== 'teacher') {
        return response.status(403).json({
          message: 'У вас нет прав для создания оценки.',
        })
      }
    
      const grade = await Grade.create({
        student_id: data.student_id,
        assignment_id: data.assignment_id,
        grade: data.grade,
        feedback: data.feedback
      })
    
      return response.status(201).json({
        message: 'Оценка успешно создана!',
        grade_id: grade.grade_id,
        grade: +grade.grade,
        feedback: grade.feedback,
        student: {
          student_id: student.user_id,
          last_name: student.last_name,
          first_name: student.first_name,
          middle_name: student.middle_name,
          email: student.email,
          role: student.role
        },
        assignment: {
          assignment_id: assignment.assignment_id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          module: {
            module_id: module.module_id,
            title: module.title,
            content: module.content,
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
          }
        },
        created_at: grade.created_at,
        updated_at: grade.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого студента или задания не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при создании оценки.',
        error: error.message
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const grade = await Grade
        .query()
        .where('grades.grade_id', params.id)
        .innerJoin('users as students', 'grades.student_id', 'students.user_id')
        .innerJoin('assignments', 'grades.assignment_id', 'assignments.assignment_id')
        .innerJoin('modules', 'assignments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teachers', 'courses.teacher_id', 'teachers.user_id')
        .select(
          'grades.grade_id',
          'grades.grade',
          'grades.feedback',
          'grades.created_at',
          'grades.updated_at',
          'students.user_id as student_id',
          'students.name as student_name',
          'students.email as student_email',
          'students.role as student_role',
          'assignments.assignment_id',
          'assignments.title as assignment_title',
          'assignments.description as assignment_description',
          'assignments.due_date as assignment_due_date',
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
        .first()
  
      if (!grade) {
        throw { status: 404, message: 'Такой оценки не существует!' }
      }
  
      if (user.role === 'student') {
        if (grade.student_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просмотреть только свою оценку.'
          }
        }
  
        const enrollment = await Enrollment
          .query()
          .where('course_id', grade.$extras.course_id)
          .andWhere('student_id', user.user_id)
          .first()
  
        if (!enrollment) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы не записаны на этот курс.'
          }
        }
  
      } else if (user.role === 'teacher') {
        if (grade.$extras.teacher_id !== user.user_id) {
          throw {
            status: 403,
            message: 'Доступ запрещён. Вы можете просматривать только оценки студентов из ваших курсов.'
          }
        }
      } else if (user.role !== 'admin') {
        throw {
          status: 403,
          message: 'Доступ запрещён. У вас нет прав для просмотра этой оценки.'
        }
      }
  
      return response.status(200).json({
        grade_id: grade.grade_id,
        grade: grade.grade,
        feedback: grade.feedback,
        student: {
          student_id: grade.student_id,
          name: grade.$extras.student_name,
          email: grade.$extras.student_email,
          role: grade.$extras.student_role
        },
        assignment: {
          assignment_id: grade.assignment_id,
          title: grade.$extras.assignment_title,
          description: grade.$extras.assignment_description,
          due_date: grade.$extras.assignment_due_date,
          module: {
            module_id: grade.$extras.module_id,
            title: grade.$extras.module_title,
            content: grade.$extras.module_content,
            order: grade.$extras.module_order,
            course: {
              course_id: grade.$extras.course_id,
              title: grade.$extras.course_title,
              description: grade.$extras.course_description,
              teacher: {
                teacher_id: grade.$extras.teacher_id,
                first_name: grade.$extras.teacher_first_name,
                last_name: grade.$extras.teacher_last_name,
                middle_name: grade.$extras.teacher_middle_name,
                email: grade.$extras.teacher_email,
                role: grade.$extras.teacher_role
              }
            }
          }
        },
        created_at: grade.created_at,
        updated_at: grade.updated_at
      })
    } catch (error) {
      if (error.status) {
        return response.status(error.status).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при получении данных об оценке.',
        error: error.message
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const data = request.only(['grade', 'feedback'])

      try {
        await updateGradeValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
  
      const grade = await Grade.findOrFail(params.id)
  
      const student = await User.findOrFail(grade.student_id)
      const assignment = await Assignment.findOrFail(grade.assignment_id)
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)
  
      const enrollment = await Enrollment.query()
        .where('course_id', course.course_id)
        .andWhere('student_id', grade.student_id)
        .first()
  
      if (!enrollment) {
        return response.status(400).json({
          message: 'Студент не записан на курс, к которому относится задание.',
        })
      }
  
      if (user.role === 'teacher') {
        if (course.teacher_id !== user.user_id) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете обновлять только оценки заданий в своих курсах.',
          })
        }
      }
  
      grade.grade = data.grade
      grade.feedback = data.feedback
  
      await grade.save()
  
      const teacher = await User.findOrFail(course.teacher_id)
  
      return response.status(200).json({
        message: 'Оценка успешно обновлена!',
        grade_id: grade.grade_id,
        grade: +grade.grade,
        feedback: grade.feedback,
        student: {
          student_id: student.user_id,
          last_name: student.last_name,
          first_name: student.first_name,
          middle_name: student.middle_name,
          email: student.email,
          role: student.role,
        },
        assignment: {
          assignment_id: assignment.assignment_id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          module: {
            module_id: module.module_id,
            title: module.title,
            content: module.content,
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
                role: teacher.role,
              },
            },
          },
        },
        created_at: grade.created_at,
        updated_at: grade.updated_at,
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Оценка не найдена!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении оценки.',
        error: error.message,
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const grade = await Grade.findOrFail(params.id)
  
      const assignment = await Assignment.findOrFail(grade.assignment_id)
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)
  
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять только оценки своих студентов.'
        })
      }
  
      await grade.delete()
  
      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Оценка не найдена!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении оценки.',
        error: error.message
      })
    }
  }
}