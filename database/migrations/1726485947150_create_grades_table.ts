import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Grades extends BaseSchema {
  protected tableName = 'grades'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('grade_id')
      table.integer('student_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE')
      table.integer('assignment_id').unsigned().notNullable().references('assignment_id').inTable('assignments').onDelete('CASCADE')
      table.decimal('grade', 5, 2)
      table.text('feedback')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}