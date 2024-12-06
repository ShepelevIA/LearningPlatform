import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Progress from '#models/progress'
import User from '#models/user'
import Module from '#models/module'
import Enrollment from '#models/enrollment'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class ProgressSeeder extends BaseSeeder {
  public async run() {
    const progresses: {
      student_id: number
      module_id: number
      status: "in_progress" | "completed"
      created_at: DateTime
      updated_at: DateTime
    }[] = []
    const usedProgresses = new Set()

    const students = await User.query().where('role', 'student').select('user_id')
    const modules = await Module.query().select('module_id', 'course_id')
    const enrollments = await Enrollment.query().select('student_id', 'course_id')

    while (progresses.length < 20) {
      const student = faker.helpers.arrayElement(students).user_id
      const module = faker.helpers.arrayElement(modules)

      const isEnrolled = enrollments.some(e => e.student_id === student && e.course_id === module.course_id)

      const progressKey = `${student}-${module.module_id}`

      if (isEnrolled && !usedProgresses.has(progressKey)) {
        progresses.push({
          student_id: student,
          module_id: module.module_id,
          status: faker.helpers.arrayElement(['in_progress', 'completed']),
          created_at: DateTime.now(),
          updated_at: DateTime.now(),
        })
        usedProgresses.add(progressKey)
      }
    }

    await Progress.createMany(progresses)
  }
}