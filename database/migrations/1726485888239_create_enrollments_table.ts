import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Enrollments extends BaseSchema {
  protected tableName = 'enrollments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('enrollment_id')
      table.integer('student_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE')
      table.integer('course_id').unsigned().notNullable().references('course_id').inTable('courses').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}