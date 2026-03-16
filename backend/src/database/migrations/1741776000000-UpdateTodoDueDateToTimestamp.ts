import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateTodoDueDateToTimestamp1741776000000 implements MigrationInterface {
  name = 'UpdateTodoDueDateToTimestamp1741776000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "dueDate" TYPE timestamptz USING "dueDate"::timestamptz`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "dueDate" TYPE date USING "dueDate"::date`)
  }
}
