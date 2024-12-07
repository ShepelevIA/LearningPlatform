import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class File extends BaseModel {
  @column({ isPrimary: true })
  declare file_id: number

  @column()
  declare resource_type: string

  @column()
  declare resource_id: number

  @column()
  declare file_url: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}