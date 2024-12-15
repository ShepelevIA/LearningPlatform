import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare user_id: number

  @column()
  declare last_name: string

  @column()
  declare first_name: string

  @column()
  declare middle_name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'student' | 'teacher' | 'admin'

  @column()
  declare is_verified: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30m',
    prefix: 'access_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  static refreshTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '7d',
    prefix: 'refresh_',
    table: 'auth_access_tokens',
    type: 'refresh_token',
    tokenSecretLength: 40,
  })
}