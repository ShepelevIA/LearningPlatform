import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Course from '#models/course'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class CourseSeeder extends BaseSeeder {
  public async run() {
    const courses: {
      title: string
      description: string
      teacher_id: number
      created_at: DateTime
      updated_at: DateTime
    }[] = []

    const teachers = await User.query().where('role', 'teacher').select('user_id')

    for (let i = 0; i < 20; i++) {
      courses.push({
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        teacher_id: faker.helpers.arrayElement(teachers).user_id,
        created_at: DateTime.now(),
        updated_at: DateTime.now(),
      })
    }

    await Course.createMany(courses)
  }
}