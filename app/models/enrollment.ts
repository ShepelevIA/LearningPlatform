import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Enrollment extends BaseModel {
  @column({ isPrimary: true })
  declare enrollment_id: number

  @column()
  declare student_id: number

  @column()
  declare course_id: number

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}

