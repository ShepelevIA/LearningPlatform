import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import CourseSeeder from './course_seeder.js'
import ModuleSeeder from './module_seeder.js'
import AssignmentSeeder from './assignment_seeder.js'
import EnrollmentSeeder from './enrollment_seeder.js'
import ProgressSeeder from './progress_seeder.js'
import GradeSeeder from './grade_seeder.js'
import CommentSeeder from './comment_seeder.js'

export default class MainSeeder extends BaseSeeder {
  public async run() {
    await new UserSeeder(this.client).run()
    await new CourseSeeder(this.client).run()
    await new ModuleSeeder(this.client).run()
    await new AssignmentSeeder(this.client).run()
    await new EnrollmentSeeder(this.client).run()
    await new ProgressSeeder(this.client).run()
    await new GradeSeeder(this.client).run()
    await new CommentSeeder(this.client).run()
  }
}