import { MigrationInterface, QueryRunner } from 'typeorm'

// best-practice: db-use-migrations
export class UpdatePriorityToNumber1741000003000 implements MigrationInterface {
  name = 'UpdatePriorityToNumber1741000003000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add a temporary integer column
    await queryRunner.query(`ALTER TABLE "todos" ADD "priority_new" smallint`)

    // Step 2: Convert existing string priorities to numbers
    await queryRunner.query(`
      UPDATE "todos" SET "priority_new" = CASE
        WHEN "priority" = 'high'   THEN 1
        WHEN "priority" = 'medium' THEN 5
        WHEN "priority" = 'low'    THEN 10
        ELSE 5
      END
    `)

    // Step 3: Set NOT NULL and default
    await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "priority_new" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "priority_new" SET DEFAULT 5`)

    // Step 4: Drop old varchar column
    await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "priority"`)

    // Step 5: Rename new column to priority
    await queryRunner.query(`ALTER TABLE "todos" RENAME COLUMN "priority_new" TO "priority"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add varchar column back
    await queryRunner.query(`ALTER TABLE "todos" ADD "priority_old" varchar(10)`)

    // Step 2: Convert numbers back to strings
    await queryRunner.query(`
      UPDATE "todos" SET "priority_old" = CASE
        WHEN "priority" <= 3  THEN 'high'
        WHEN "priority" <= 7  THEN 'medium'
        ELSE 'low'
      END
    `)

    // Step 3: Set NOT NULL and default
    await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "priority_old" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "todos" ALTER COLUMN "priority_old" SET DEFAULT 'medium'`)

    // Step 4: Drop smallint column
    await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "priority"`)

    // Step 5: Rename back
    await queryRunner.query(`ALTER TABLE "todos" RENAME COLUMN "priority_old" TO "priority"`)
  }
}
