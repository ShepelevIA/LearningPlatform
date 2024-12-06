import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Modules extends BaseSchema {
  protected tableName = 'modules'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('module_id')
      table.integer('course_id').unsigned().notNullable().references('course_id').inTable('courses').onDelete('CASCADE')
      table.string('title', 255).notNullable()
      table.text('content')
      table.integer('order').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}