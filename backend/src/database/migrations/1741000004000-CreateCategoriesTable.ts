import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm'

// best-practice: db-use-migrations
export class CreateCategoriesTable1741000004000 implements MigrationInterface {
  name = 'CreateCategoriesTable1741000004000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'color',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'#6366f1'"
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      true
    )

    // Index for fast per-user queries
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_categories_userId',
        columnNames: ['userId']
      })
    )

    // Foreign key to users
    await queryRunner.createForeignKey(
      'categories',
      new TableForeignKey({
        name: 'FK_categories_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    )

    // Add categoryId column to todos
    await queryRunner.query(`ALTER TABLE "todos" ADD "categoryId" uuid`)

    // Foreign key: todos → categories
    await queryRunner.createForeignKey(
      'todos',
      new TableForeignKey({
        name: 'FK_todos_categoryId',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('todos', 'FK_todos_categoryId')
    await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "categoryId"`)
    await queryRunner.dropForeignKey('categories', 'FK_categories_userId')
    await queryRunner.dropIndex('categories', 'IDX_categories_userId')
    await queryRunner.dropTable('categories', true)
  }
}
