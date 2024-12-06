import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Assignment extends BaseModel {
  @column({ isPrimary: true })
  declare assignment_id: number

  @column()
  declare module_id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare due_date: Date

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}