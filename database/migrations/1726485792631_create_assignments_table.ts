import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Assignments extends BaseSchema {
  protected tableName = 'assignments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('assignment_id')
      table.integer('module_id').unsigned().notNullable().references('module_id').inTable('modules').onDelete('CASCADE')
      table.string('title', 255).notNullable()
      table.text('description')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}