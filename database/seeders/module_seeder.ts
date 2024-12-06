import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Module from '#models/module'
import Course from '#models/course'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class ModuleSeeder extends BaseSeeder {
  public async run() {
    const modules: {
      course_id: number
      title: string
      content: string
      order: number
      created_at: DateTime
      updated_at: DateTime
    }[] = []

    const courses = await Course.query().select('course_id')

    for (let i = 0; i < 20; i++) {
      modules.push({
        course_id: faker.helpers.arrayElement(courses).course_id,
        title: faker.lorem.words(2),
        content: faker.lorem.paragraph(),
        order: i + 1,
        created_at: DateTime.now(),
        updated_at: DateTime.now(),
      })
    }

    await Module.createMany(modules)
  }
}