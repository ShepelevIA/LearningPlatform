import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('user_id')
      table.string('last_name', 100).notNullable()
      table.string('first_name', 100).notNullable()
      table.string('middle_name', 100).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password', 255).notNullable()
      table.enu('role', ['student', 'teacher', 'admin']).notNullable()
      table.boolean('is_verified').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

