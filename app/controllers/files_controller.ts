import type { HttpContext } from '@adonisjs/core/http'
import File from '#models/file'
import Assignment from '#models/assignment'
import Module from '#models/module'
import Course from '#models/course'
import Enrollment from '#models/enrollment'
import fs from 'fs'
import path from 'path'

export default class FilesController {
  /**
   * Display a list of files
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
    
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
    
      let query = File
        .query()
        .innerJoin('users', 'files.user_id', 'users.user_id')
        .innerJoin('assignments', 'files.assignment_id', 'assignments.assignment_id')
        .innerJoin('modules', 'assignments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
    
      if (user.role === 'student') {
        query = query
          .innerJoin('enrollments', 'courses.course_id', 'enrollments.course_id')
          .where('enrollments.student_id', user.user_id)
          .andWhere(q => 
            q.where('files.user_id', user.user_id)
             .orWhere('files.user_id', 'courses.teacher_id')
          )
      } else if (user.role === 'teacher') {
        query = query.where(q => 
          q.where('courses.teacher_id', user.user_id)
           .orWhere('files.user_id', user.user_id)
        )
      }
    
      const paginatedFiles = await query
        .select(
          'files.file_id',
          'files.file_url',
          'files.created_at',
          'files.updated_at',
          'users.user_id as uploader_id',
          'users.name as uploader_name',
          'users.email as uploader_email',
          'users.role as uploader_role',
          'assignments.assignment_id',
          'assignments.title as assignment_title',
          'assignments.description as assignment_description'
        )
        .paginate(page, limit)
  
      const paginatedFilesJson = paginatedFiles.toJSON()
      paginatedFilesJson.data = paginatedFilesJson.data.map(file => ({
        file_id: file.file_id,
        file_url: file.file_url,
        created_at: file.created_at,
        updated_at: file.updated_at,
        uploader: {
          user_id: file.$extras.uploader_id,
          name: file.$extras.uploader_name,
          email: file.$extras.uploader_email,
          role: file.$extras.uploader_role,
        },
        assignment: {
          assignment_id: file.assignment_id,
          title: file.$extras.assignment_title,
          description: file.$extras.assignment_description,
        }
      }))
    
      return response.status(200).json(paginatedFilesJson)
    } catch (error) {
      return response.status(500).json({
        message: 'Произошла ошибка при получении списка файлов.',
        error: error.message,
      })
    }
  }

  /**
   * Create a new file
   */
  async create({ request, response, auth }: HttpContext) {
    const data = request.only(['assignment_id'])
    const file = request.file('file', {
      extnames: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'xlsx', 'pptx'],
      size: '20mb'
    })
  
    try {
      if (!file) {
        return response.status(400).json({ message: 'Файл обязателен для загрузки' })
      }
  
      const assignment = await Assignment.findOrFail(data.assignment_id)
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)
  
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      if (user.role === 'student') {
        const enrollment = await Enrollment.query()
          .where('student_id', user.user_id)
          .andWhere('course_id', course.course_id)
          .first()
  
        if (!enrollment) {
          return response.status(403).json({
            message: 'Доступ запрещен. Вы можете загружать файлы только по курсам, на которые зачислены.'
          })
        }
      }
  
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете загружать файлы только по заданиям своих курсов.'
        })
      }
  
      const fileName = `${new Date().getTime()}.${file.extname}`
      
      await file.move(path.resolve('public/uploads'), {
        name: fileName,
        overwrite: true,
      })
  
      const newFile = await File.create({
        assignment_id: data.assignment_id,
        user_id: user.user_id,
        file_url: `/uploads/${fileName}`
      })
  
      return response.status(201).json({
        message: 'Файл успешно загружен!',
        file_id: newFile.file_id,
        file_url: newFile.file_url,
        assignment: {
          assignment_id: assignment.assignment_id,
          title: assignment.title,
          description: assignment.description
        },
        uploader: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        created_at: newFile.created_at,
        updated_at: newFile.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого задания или пользователя не существует!',
        })
      }
  
      return response.status(500).json({
        message: 'Произошла ошибка при загрузке файла.',
        error: error.message
      })
    }
  }

  /**
   * Show individual file
   */
  async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      const file = await File
        .query()
        .where('files.file_id', params.id)
        .innerJoin('users as uploader', 'files.user_id', 'uploader.user_id')
        .innerJoin('assignments', 'files.assignment_id', 'assignments.assignment_id')
        .innerJoin('modules', 'assignments.module_id', 'modules.module_id')
        .innerJoin('courses', 'modules.course_id', 'courses.course_id')
        .innerJoin('users as teacher', 'courses.teacher_id', 'teacher.user_id')
        .select(
          'files.file_id',
          'files.file_url',
          'files.created_at',
          'files.updated_at',
          'uploader.user_id as uploader_id',
          'uploader.name as uploader_name',
          'uploader.email as uploader_email',
          'uploader.role as uploader_role',
          'assignments.assignment_id',
          'assignments.title as assignment_title',
          'assignments.description as assignment_description',
          'courses.course_id as course_id',
          'courses.teacher_id as course_teacher_id',
          'teacher.user_id as teacher_id',
          'teacher.name as teacher_name',
          'teacher.email as teacher_email',
          'teacher.role as teacher_role'
        )
        .first()
  
      if (!file) {
        throw { status: 404, message: 'Такого файла не существует!' }
      }

      if (user.role === 'admin') {
      } else if (user.role === 'teacher') {
  
        if (file.$extras.uploader_id === user.user_id) {
        } else {
          if (file.$extras.course_teacher_id !== user.user_id) {
            throw {
              status: 403,
              message: 'Доступ запрещён. Вы можете просматривать только свои файлы и файлы студентов ваших курсов.'
            }
          }
        }
      } else if (user.role === 'student') {
  
        if (file.$extras.uploader_id === user.user_id) {
        } else {
          const enrollment = await Enrollment
            .query()
            .where('course_id', file.$extras.course_id)
            .andWhere('student_id', user.user_id)
            .first()
  
          if (!enrollment) {
            throw {
              status: 403,
              message: 'Доступ запрещён. Вы можете просматривать только свои файлы и файлы преподавателей ваших курсов.'
            }
          }
  
          if (file.$extras.uploader_id !== file.$extras.teacher_id) {
            throw {
              status: 403,
              message: 'Доступ запрещён. Вы можете просматривать только свои файлы и файлы преподавателей ваших курсов.'
            }
          }
        }
      } else {
        throw {
          status: 403,
          message: 'Доступ запрещён. У вас нет прав для просмотра этого файла.'
        }
      }
  
      return response.status(200).json({
        file_id: file.file_id,
        file_url: file.file_url,
        created_at: file.created_at,
        updated_at: file.updated_at,
        uploader: {
          user_id: file.$extras.uploader_id,
          name: file.$extras.uploader_name,
          email: file.$extras.uploader_email,
          role: file.$extras.uploader_role
        },
        assignment: {
          assignment_id: file.assignment_id,
          title: file.$extras.assignment_title,
          description: file.$extras.assignment_description
        }
      })
    } catch (error) {
      if (error.status) {
        return response.status(error.status).json({ message: error.message })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при получении файла.',
        error: error.message
      })
    }
  }

  /**
   * Update file
   */
  async update({ params, request, auth, response }: HttpContext) {
    const data = request.only(['assignment_id'])
    const fileUpload = request.file('file', {
      extnames: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'xlsx', 'pptx'],
      size: '20mb'
    })
  
    try {
      const file = await File.findOrFail(params.id)
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }
  
      if (file.user_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете обновлять только свои файлы.',
        })
      }
  
      const assignment = await Assignment.findOrFail(file.assignment_id)
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)
  
      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете обновлять файлы только для заданий своих курсов.'
        })
      }
  

      if (data.assignment_id && data.assignment_id !== file.assignment_id) {
        await Assignment.findOrFail(data.assignment_id) 
        file.assignment_id = data.assignment_id
      }
  
      if (fileUpload) {
        const oldFilePath = path.join('public', file.file_url)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath) 
        }
  
        const newFileName = `${new Date().getTime()}.${fileUpload.extname}`
        await fileUpload.move(path.resolve('public/uploads'), {
          name: newFileName,
          overwrite: true,
        })
  
        file.file_url = `/uploads/${newFileName}`
      }
  
      await file.save() 
  
      return response.status(200).json({
        message: 'Файл успешно обновлен!',
        file_id: file.file_id,
        file_url: file.file_url,
        assignment: {
          assignment_id: assignment.assignment_id,
          title: assignment.title,
          description: assignment.description
        },
        uploader: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        created_at: file.created_at,
        updated_at: file.updated_at
      })
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого файла не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при обновлении файла.',
        error: error.message
      })
    }
  }

  /**
   * Delete file
   */
  async destroy({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({ message: 'Пользователь не аутентифицирован' })
      }

      const file = await File.findOrFail(params.id)

      const assignment = await Assignment.findOrFail(file.assignment_id)
      const module = await Module.findOrFail(assignment.module_id)
      const course = await Course.findOrFail(module.course_id)

      if (user.role === 'student' && file.user_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять только свои файлы.'
        })
      }

      if (user.role === 'teacher' && course.teacher_id !== user.user_id) {
        return response.status(403).json({
          message: 'Доступ запрещен. Вы можете удалять файлы только для заданий своих курсов.'
        })
      }

      const filePath = path.join('public', file.file_url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      await file.delete()

      return response.status(204).noContent()
    } catch (error) {
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого файла не существует!',
        })
      }
      return response.status(500).json({
        message: 'Произошла ошибка при удалении файла.',
        error: error.message
      })
    }
  }
}