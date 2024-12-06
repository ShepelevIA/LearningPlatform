import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Progress extends BaseModel {
  @column({ isPrimary: true })
  declare progress_id: number

  @column()
  declare student_id: number

  @column()
  declare module_id: number

  @column()
  declare status: 'in_progress' | 'completed'

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}