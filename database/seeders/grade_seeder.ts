import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Grade from '#models/grade'
import Assignment from '#models/assignment'
import User from '#models/user'
import Enrollment from '#models/enrollment'
import Module from '#models/module'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class GradeSeeder extends BaseSeeder {
  public async run() {
    const grades: {
      student_id: number;
      assignment_id: number;
      grade: number;
      feedback: string;
      created_at: DateTime;
      updated_at: DateTime;
    }[] = []
    const usedGrades = new Set()

    const students = await User.query().where('role', 'student').select('user_id')

    const assignments = await Assignment.query().select('assignment_id', 'module_id')

    const enrollments = await Enrollment.query().select('student_id', 'course_id')

    const modules = await Module.query().select('module_id', 'course_id')

    while (grades.length < 20) {
      const student = faker.helpers.arrayElement(students).user_id
      const assignment = faker.helpers.arrayElement(assignments)

      const moduleCourse = modules.find(module => module.module_id === assignment.module_id)

      const isEnrolled = enrollments.some(e => e.student_id === student && e.course_id === moduleCourse?.course_id)

      const gradeKey = `${student}-${assignment.assignment_id}`

      if (isEnrolled && !usedGrades.has(gradeKey)) {
        grades.push({
          student_id: student,
          assignment_id: assignment.assignment_id,
          grade: faker.number.int({ min: 50, max: 100 }),
          feedback: faker.lorem.sentence(),
          created_at: DateTime.now(),
          updated_at: DateTime.now(),
        })
        usedGrades.add(gradeKey)
      }
    }

    await Grade.createMany(grades)
  }
}