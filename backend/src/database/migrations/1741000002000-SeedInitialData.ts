import { MigrationInterface, QueryRunner } from 'typeorm'
import * as bcrypt from 'bcryptjs'

const SEED_PASSWORD = 'Password123!'

const USERS = [
  { name: 'Alice Demo', email: 'alice@demo.com' },
  { name: 'Bob Demo', email: 'bob@demo.com' }
]

const TODO_TEMPLATES = [
  { title: 'Buy groceries', description: 'Milk, eggs, bread', completed: false },
  { title: 'Read a book', description: null, completed: true },
  { title: 'Exercise 30 minutes', description: 'Morning run or gym', completed: false },
  { title: 'Write unit tests', description: 'Cover the auth module', completed: false },
  { title: 'Review pull requests', description: null, completed: true }
]

export class SeedInitialData1741000002000 implements MigrationInterface {
  name = 'SeedInitialData1741000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hash = bcrypt.hashSync(SEED_PASSWORD, 10)

    for (const user of USERS) {
      // Skip if user already exists (idempotent)
      const existing = (await queryRunner.query(`SELECT id FROM "users" WHERE email = $1`, [user.email])) as unknown[]
      if (existing.length > 0) continue

      const result = (await queryRunner.query(
        `INSERT INTO "users" ("name", "email", "password", "avatarUrl")
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [user.name, user.email, hash, null]
      )) as { id: string }[]

      const userId = result[0].id
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7)
      const dueDateStr = dueDate.toISOString().split('T')[0]

      for (const todo of TODO_TEMPLATES) {
        await queryRunner.query(
          `INSERT INTO "todos" ("title", "description", "completed", "dueDate", "priority", "images", "userId")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [todo.title, todo.description, todo.completed, dueDateStr, 'medium', null, userId]
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const user of USERS) {
      await queryRunner.query(`DELETE FROM "users" WHERE email = $1`, [user.email])
    }
  }
}
