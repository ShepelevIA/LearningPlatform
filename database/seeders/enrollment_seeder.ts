import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Enrollment from '#models/enrollment'
import User from '#models/user'
import Course from '#models/course'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class EnrollmentSeeder extends BaseSeeder {
  public async run() {
    const enrollments: {
      student_id: number
      course_id: number
      created_at: DateTime
      updated_at: DateTime
    }[] = []
    const usedEnrollments = new Set()

    const students = await User.query().where('role', 'student').select('user_id')
    const courses = await Course.query().select('course_id')

    while (enrollments.length < 20) {
      const student = faker.helpers.arrayElement(students).user_id
      const course = faker.helpers.arrayElement(courses).course_id

      const enrollmentKey = `${student}-${course}`

      if (!usedEnrollments.has(enrollmentKey)) {
        enrollments.push({
          student_id: student,
          course_id: course,
          created_at: DateTime.now(),
          updated_at: DateTime.now(),
        })
        usedEnrollments.add(enrollmentKey)
      }
    }

    await Enrollment.createMany(enrollments)
  }
}