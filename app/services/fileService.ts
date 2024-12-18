import File from '#models/file'
import User from '#models/user'
import path from 'path'
import fs from 'fs'
import RoleFileService from '#services/roleFileService'

export default class FileService {
  static allowedExtensions = ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'xlsx', 'pptx']

  private static checkAccess(
    user: any,
    roleRules: Record<string, string[]>,
    action: string
  ) {
    const allowedActions = roleRules[user.role]
    if (!allowedActions) {
      throw new Error(`Роль '${user.role}' не найдена в правилах`)
    }
    if (!allowedActions.includes(action)) {
      throw new Error(
        `Доступ запрещён: у роли '${user.role}' нет разрешения '${action}'. Доступные действия: ${allowedActions.join(', ')}`
      )
    }
  }

  public static async attachFileToModel(
    user: any,
    modelInstance: any,
    fileUpload: any,
    roleRules: Record<string, Record<string, string[]>>
  ) {
    const resourceType = modelInstance.resource_type || modelInstance.constructor.table
    const resourceRules = roleRules[resourceType]
  
    if (!resourceRules) {
      throw new Error(`Нет правил доступа для ресурса '${resourceType}'`)
    }
  
    this.checkAccess(user, resourceRules, 'create')
  
    if (!this.allowedExtensions.includes(fileUpload.extname)) {
      throw new Error('Недопустимый формат файла')
    }
  
    const resource_id = modelInstance.resource_id || modelInstance[modelInstance.constructor.primaryKey]
  
    const fileName = `${Date.now()}.${fileUpload.extname}`
    await fileUpload.move(path.resolve('public/uploads'), {
      name: fileName,
      overwrite: true,
    })
  
    return File.create({
      resource_type: resourceType,
      resource_id,
      file_url: `/uploads/${fileName}`,
      user_id: user.user_id,
    })
  }

  public static async getFilesForModelWithPagination(
    user: any,
    resourceId: number[] | null,
    resourceType: string | null,
    roleRules: Record<string, Record<string, string[]>>,
    page: number,
    limit: number,
    usePagination: boolean = true,
    user_id: number | null = null
  ) {
    const query = File.query()
  
    if (resourceType) {
      query.where('resource_type', resourceType)
    }
  
    if (resourceId && Array.isArray(resourceId)) {
      query.andWhereIn('resource_id', resourceId)
    }
  
    if (user_id) {
      if (Array.isArray(user_id)) {
        query.whereIn('user_id', user_id)
      } else {
        query.where('user_id', user_id)
      }
    }
  
    if (resourceType) {
      const resourceRules = roleRules[resourceType]
      if (!resourceRules) {
        throw new Error(`Нет правил доступа для ресурса '${resourceType}'`)
      }
  
      const userRules = resourceRules[user.role]
      if (!userRules) {
        throw new Error(`Нет правил для роли '${user.role}' для ресурса '${resourceType}'`)
      }
  
      if (userRules.includes('view-all')) {
        return usePagination ? await query.paginate(page, limit) : await query
      }
  
      this.checkAccess(user, resourceRules, 'view')
  
      if (userRules.includes('view-students') && user.role === 'teacher') {
        const studentIds = await User.query()
          .where('role', 'student')
          .select('user_id')
          .then((users) => users.map((user) => user.user_id))
  
        query.where((subQuery) => {
          subQuery.where('user_id', user.user_id).orWhereIn('user_id', studentIds)
        })
      } else if (userRules.includes('view-own')) {
        query.where('user_id', user.user_id)
      }
    }
  
    if (!usePagination) {
      return await query
    }
  
    return await query.paginate(page, limit)
  }

  public static async show(
    user: any,
    roleRules: Record<string, Record<string, string[]>>,
    fileId: number
  ) {
    const file = await File.query().where('file_id', fileId).firstOrFail()
  
    const resourceRules = roleRules[file.resource_type]
    if (!resourceRules) {
      throw new Error(`Нет правил доступа для ресурса '${file.resource_type}'`)
    }
  
    this.checkAccess(user, resourceRules, 'view')
  
    if (resourceRules[user.role]?.includes('show-own') && file.user_id !== user.user_id) {
      throw new Error('Доступ запрещён: можно просматривать только свои файлы')
    }
  
    return file
  }

  public static async updateFileForModel(
    user: any,
    newFileUpload: any,
    fileId: number,
    roleRules: Record<string, Record<string, string[]>>
  ) {
 
    const file = await File.query().where('file_id', fileId).firstOrFail()
  

    const resourceRules = roleRules[file.resource_type]
    if (!resourceRules) {
      throw new Error(`Нет правил доступа для ресурса '${file.resource_type}'`)
    }
  
    const userRules = resourceRules[user.role]
    if (!userRules) {
      throw new Error(`Нет правил для роли '${user.role}' для ресурса '${file.resource_type}'`)
    }
  
    if (userRules.includes('update')) {
      this.checkAccess(user, resourceRules, 'update')
    } else if (userRules.includes('update-own')) {
      if (file.user_id !== user.user_id) {
        throw new Error('Доступ запрещён: можно обновлять только свои файлы')
      }
    } else {
      throw new Error(
        `Доступ запрещён: у роли '${user.role}' нет разрешения 'update' или 'update-own'. Доступные действия: ${userRules.join(', ')}`
      )
    }
  
    const oldFilePath = path.resolve('public', file.file_url)
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath)
    }
  
    const newFileName = `${Date.now()}.${newFileUpload.extname}`
    await newFileUpload.move(path.resolve('public/uploads'), {
      name: newFileName,
      overwrite: true,
    })
  
    file.file_url = `/uploads/${newFileName}`
    await file.save()
  
    return file
  }

  public static async deleteFileForModel(
    user: any,
    fileId: number,
    roleRules: Record<string, Record<string, string[]>>
  ) {
    const file = await File.query().where('file_id', fileId).firstOrFail()
  
    const resourceRules = roleRules[file.resource_type]
    if (!resourceRules) {
      throw new Error(`Нет правил доступа для ресурса '${file.resource_type}'`)
    }
  
    const userRules = resourceRules[user.role]
    if (!userRules) {
      throw new Error(`Нет правил для роли '${user.role}' для ресурса '${file.resource_type}'`)
    }
  
    if (userRules.includes('delete')) {
      this.checkAccess(user, resourceRules, 'delete') 
    } else if (userRules.includes('delete-own')) {
      if (file.user_id !== user.user_id) {
        throw new Error('Доступ запрещён: можно удалять только свои файлы')
      }
    } else {
      throw new Error(
        `Доступ запрещён: у роли '${user.role}' нет разрешения 'delete' или 'delete-own'. Доступные действия: ${userRules.join(', ')}`
      )
    }
  
    const fullPath = path.resolve('public', file.file_url)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  
    await file.delete()
  }
}