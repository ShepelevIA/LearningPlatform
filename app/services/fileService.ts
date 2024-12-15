import File from '#models/file'
import path from 'path'
import fs from 'fs'

export default class FileService {
  static allowedExtensions = ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'xlsx', 'pptx']

  public static async attachFileToModel(modelInstance: any, fileUpload: any) {
    if (!this.allowedExtensions.includes(fileUpload.extname)) {
      throw new Error('Недопустимый формат файла')
    }

    const ModelClass = modelInstance.constructor
    const resource_type = ModelClass.table
    const resource_id = modelInstance[ModelClass.primaryKey]

    const fileName = `${Date.now()}.${fileUpload.extname}`
    await fileUpload.move(path.resolve('public/uploads'), {
      name: fileName,
      overwrite: true,
    })

    return File.create({ resource_type, resource_id, file_url: `/uploads/${fileName}` })
  }

  public static async getFilesForModel(modelInstance: any) {
    const ModelClass = modelInstance.constructor
    const resource_type = ModelClass.table
    const resource_id = modelInstance[ModelClass.primaryKey]

    return File.query().where({ resource_type, resource_id })
  }

  public static async deleteFileForModel(modelInstance: any, file_id: number) {
    const ModelClass = modelInstance.constructor
    const resource_type = ModelClass.table
    const resource_id = modelInstance[ModelClass.primaryKey]

    const file = await File
      .query()
      .where({ resource_type, resource_id, file_id })
      .firstOrFail()

    const fullPath = path.join('public', file.file_url)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }

    await file.delete()
  }

  public static async updateFileForModel(modelInstance: any, file_id: number, newFileUpload: any) {
    await this.deleteFileForModel(modelInstance, file_id)
    return this.attachFileToModel(modelInstance, newFileUpload)
  }
}