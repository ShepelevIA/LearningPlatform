import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Token extends BaseModel {
  static table = 'auth_access_tokens'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tokenable_id: number

  @column()
  declare type: string

  @column()
  declare name?: string

  @column()
  declare hash: string

  @column()
  declare abilities?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  
}