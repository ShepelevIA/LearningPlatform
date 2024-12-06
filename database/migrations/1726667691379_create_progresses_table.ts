import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Progress extends BaseSchema {
  protected tableName = 'progresses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('progress_id')
      table.integer('student_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE')
      table.integer('module_id').unsigned().notNullable().references('module_id').inTable('modules').onDelete('CASCADE')
      table.enu('status', ['in_progress', 'completed']).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}