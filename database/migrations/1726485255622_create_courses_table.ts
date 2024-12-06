import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Courses extends BaseSchema {
  protected tableName = 'courses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('course_id')
      table.string('title', 255).notNullable()
      table.text('description')
      table.integer('teacher_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
