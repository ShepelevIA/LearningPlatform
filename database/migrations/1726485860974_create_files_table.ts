import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Files extends BaseSchema {
  protected tableName = 'files'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('file_id')
      table.integer('assignment_id').unsigned().notNullable().references('assignment_id').inTable('assignments').onDelete('CASCADE')
      table.integer('user_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE')
      table.string('file_url', 255).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}