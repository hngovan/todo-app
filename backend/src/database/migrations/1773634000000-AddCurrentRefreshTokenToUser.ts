import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCurrentRefreshTokenToUser1773634000000 implements MigrationInterface {
  name = 'AddCurrentRefreshTokenToUser1773634000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "currentRefreshToken" character varying(500)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentRefreshToken"`)
  }
}
