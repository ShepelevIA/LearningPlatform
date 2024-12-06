import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Module extends BaseModel {
  @column({ isPrimary: true })
  declare module_id: number

  @column()
  declare course_id: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}