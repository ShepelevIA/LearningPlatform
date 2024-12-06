import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Comment from '#models/comment'
import User from '#models/user'
import Module from '#models/module'
import Enrollment from '#models/enrollment'
import Course from '#models/course'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class CommentSeeder extends BaseSeeder {
  public async run() {
    const comments: {
      module_id: number
      user_id: number
      content: string
      created_at: DateTime
      updated_at: DateTime
    }[] = []

    const users = await User.query().select('user_id', 'role')
    const modules = await Module.query().select('module_id', 'course_id')
    const enrollments = await Enrollment.query().select('student_id', 'course_id')
    const courses = await Course.query().select('course_id', 'teacher_id')

    while (comments.length < 20) {
      const module = faker.helpers.arrayElement(modules)
      const user = faker.helpers.arrayElement(users)

      const isEnrolled = enrollments.some(e => e.student_id === user.user_id && e.course_id === module.course_id)
      const isTeacher = courses.some(c => c.teacher_id === user.user_id && c.course_id === module.course_id)

      if (isEnrolled || isTeacher) {
        comments.push({
          module_id: module.module_id,
          user_id: user.user_id,
          content: faker.lorem.sentence(),
          created_at: DateTime.now(),
          updated_at: DateTime.now(),
        })
      }
    }

    await Comment.createMany(comments)
  }
}