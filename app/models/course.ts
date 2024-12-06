import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Course extends BaseModel {
  @column({ isPrimary: true })
  declare course_id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare teacher_id: number

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

}