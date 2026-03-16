import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateHolidaysTable1773395177174 implements MigrationInterface {
  name = 'CreateHolidaysTable1773395177174'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "name" character varying NOT NULL, "localName" character varying NOT NULL, "countryCode" character varying(2) NOT NULL DEFAULT 'VN', CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b83571c6ab9608ee1da3b7dc35" ON "holidays" ("date", "countryCode") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_b83571c6ab9608ee1da3b7dc35"`)
    await queryRunner.query(`DROP TABLE "holidays"`)
  }
}
