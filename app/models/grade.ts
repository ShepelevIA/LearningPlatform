import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Grade extends BaseModel {
  @column({ isPrimary: true })
  declare grade_id: number

  @column()
  declare student_id: number

  @column()
  declare assignment_id: number

  @column()
  declare grade: number

  @column()
  declare feedback: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}