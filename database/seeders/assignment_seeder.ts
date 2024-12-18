import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Assignment from '#models/assignment'
import Module from '#models/module'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class AssignmentSeeder extends BaseSeeder {
  public async run() {
    const assignments: {
      module_id: number
      title: string
      description: string
      created_at: DateTime
      updated_at: DateTime
    }[] = []

    const modules = await Module.query().select('module_id')

    for (let i = 0; i < 20; i++) {
      assignments.push({
        module_id: faker.helpers.arrayElement(modules).module_id,
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        created_at: DateTime.now(),
        updated_at: DateTime.now(),
      })
    }

    await Assignment.createMany(assignments)
  }
}