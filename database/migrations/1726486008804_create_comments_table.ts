import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Comments extends BaseSchema {
  protected tableName = 'comments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('comment_id')
      table.integer('module_id').unsigned().notNullable().references('module_id').inTable('modules').onDelete('CASCADE')
      table.integer('user_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE')
      table.text('content').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}