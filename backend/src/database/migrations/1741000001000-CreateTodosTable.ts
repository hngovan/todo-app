import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm'

export class CreateTodosTable1741000001000 implements MigrationInterface {
  name = 'CreateTodosTable1741000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'todos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'completed',
            type: 'boolean',
            default: false
          },
          {
            name: 'dueDate',
            type: 'date',
            isNullable: true
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '10',
            default: "'medium'",
            isNullable: false
          },
          {
            name: 'images',
            type: 'text',
            isNullable: true,
            default: 'null'
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
      true // ifNotExists
    )

    // Index for fast per-user queries (best-practice: db-avoid-n-plus-one)
    await queryRunner.createIndex(
      'todos',
      new TableIndex({
        name: 'IDX_todos_userId',
        columnNames: ['userId']
      })
    )

    // Foreign key to users
    await queryRunner.createForeignKey(
      'todos',
      new TableForeignKey({
        name: 'FK_todos_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('todos', 'FK_todos_userId')
    await queryRunner.dropIndex('todos', 'IDX_todos_userId')
    await queryRunner.dropTable('todos', true)
  }
}
