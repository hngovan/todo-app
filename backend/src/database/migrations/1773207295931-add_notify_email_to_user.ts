import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotifyEmailToUser1773207295931 implements MigrationInterface {
  name = 'AddNotifyEmailToUser1773207295931'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_userId"`)
    await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_todos_userId"`)
    await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_todos_categoryId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_userId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_todos_userId"`)
    await queryRunner.query(`ALTER TABLE "users" ADD "notifyEmail" boolean NOT NULL DEFAULT true`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "avatarUrl" DROP DEFAULT`)
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "todos" ADD CONSTRAINT "FK_4583be7753873b4ead956f040e3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "todos" ADD CONSTRAINT "FK_b875cb9ebf0be6ff05ff0174926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_b875cb9ebf0be6ff05ff0174926"`)
    await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_4583be7753873b4ead956f040e3"`)
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741"`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "avatarUrl" SET DEFAULT NULL`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notifyEmail"`)
    await queryRunner.query(`CREATE INDEX "IDX_todos_userId" ON "todos" ("userId") `)
    await queryRunner.query(`CREATE INDEX "IDX_categories_userId" ON "categories" ("userId") `)
    await queryRunner.query(
      `ALTER TABLE "todos" ADD CONSTRAINT "FK_todos_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "todos" ADD CONSTRAINT "FK_todos_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
