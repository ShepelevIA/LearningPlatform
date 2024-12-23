import type { HttpContext } from '@adonisjs/core/http'
import FileService from '#services/fileService'
import RoleFileService from '#services/roleFileService'

import { createFileValidator, updateFileValidator } from '#validators/file'

export default class FilesController {
  /**
   * Display a list of resource
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }
  
      const resourceType = request.input('resource_type')
      const resourceId = request.input('resource_id')
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const usePagination = request.input('usePagination') === 'false' ? false : true
      const user_id = request.input('user_id')
  
      const resourceIdsArray = Array.isArray(resourceId)
        ? resourceId.map(Number)
        : typeof resourceId === 'string'
        ? resourceId.split(',').map((id) => parseInt(id.trim(), 10))
        : null
  
      if (resourceIdsArray && resourceIdsArray.some(isNaN)) {
        return response.status(400).json({ message: 'Некорректный формат resourceId' })
      }
  
      const files = await FileService.getFilesForModelWithPagination(
        user,
        resourceIdsArray,
        resourceType,
        RoleFileService,
        page,
        limit,
        usePagination,
        user_id
      )
  
      return response.status(200).json(files)
    } catch (error) {
      console.error('Ошибка в FilesController:', error)
      return response.status(500).json({
        message: 'Ошибка при получении файлов',
        error: error.message,
      })
    }
  }

  /**
   * Display form to create a new record
   */
  async create({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
  
      if (!user) {
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }
  
      const data = request.only(['resource_type', 'resource_id'])
      const fileUpload = request.file('file')

      const combinedData = {
        ...data,
        file: fileUpload,
      }

      try {
        await createFileValidator.validate(combinedData)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
  
      if (!fileUpload) {
        return response.status(400).json({ message: 'Файл не загружен' })
      }
  
      const file = await FileService.attachFileToModel(
        user,
        data,
        fileUpload,
        RoleFileService
      )
  
      return response.status(201).json(file)
    } catch (error) {
      console.error('Ошибка при создании файла:', error)
      return response.status(500).json({
        message: 'Ошибка при создании файла',
        error: error.message,
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
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }
  
      const fileId = params.id
  
      if (!fileId) {
        return response.status(400).json({ message: 'Необходимо указать ID файла' })
      }
  
      const file = await FileService.show(user, RoleFileService, fileId)
  
      return response.status(200).json(file)
    } catch (error) {
      if(error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Такого файла не существует!',
        })
      }
      return response.status(500).json({
        message: 'Ошибка при получении файла',
        error: error.message,
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
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }
  
      const fileId = params.id
  
      const fileUpload = request.file('file')

      const data = {
        file: fileUpload,
      }

      try {
        await updateFileValidator.validate(data)
      } catch (validationError) {
        return response.status(422).json({
          message: 'Ошибка валидации данных',
          errors: validationError.messages,
        })
      }
      
      const updatedFile = await FileService.updateFileForModel(
        user,
        fileUpload,
        fileId,
        RoleFileService
      )
  
      return response.status(200).json(updatedFile)
    } catch (error) {
      console.error('Ошибка в методе update:', error)
  
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Файл не найден',
        })
      }
  
      return response.status(500).json({
        message: 'Ошибка при обновлении файла',
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
        return response.status(401).json({ message: 'Пользователь не авторизован' })
      }
  
      const fileId = params.id
  
      if (!fileId) {
        return response.status(400).json({ message: 'Необходимо указать ID файла' })
      }
  
      await FileService.deleteFileForModel(user, fileId, RoleFileService)
  
      return response.status(204).json({ message: 'Файл успешно удалён' })
    } catch (error) {
      console.error('Ошибка в методе destroy:', error)
  
      if (error.message.includes('Row not found')) {
        return response.status(404).json({
          message: 'Файл не найден',
        })
      }
  
      return response.status(500).json({
        message: 'Ошибка при удалении файла',
        error: error.message,
      })
    }
  }
}