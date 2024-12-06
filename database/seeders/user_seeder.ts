import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const users: {
      name: string
      email: string
      password: string
      role: "admin" | "teacher" | "student"
      created_at: DateTime
      updated_at: DateTime
    }[] = []

    const roles: Array<"admin" | "teacher" | "student"> = ['admin', 'teacher', 'student']
    const domains = ['mail.ru', 'gmail.com', 'yandex.ru']

    for (const role of roles) {
      const numberOfUsers = role === 'student' ? 15 : 2
      for (let i = 0; i < numberOfUsers; i++) {
        const firstName = faker.person.firstName().toLowerCase()
        const lastName = faker.person.lastName().toLowerCase()
        const domain = faker.helpers.arrayElement(domains)

        users.push({
          name: `${firstName} ${lastName}`,
          email: `${firstName}_${lastName}@${domain}`,
          password: '1234',
          role,
          created_at: DateTime.now(),
          updated_at: DateTime.now(),
        })
      }
    }

    await User.createMany(users)
  }
}