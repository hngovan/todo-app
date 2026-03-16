import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateNotificationLogsTable1741776001000 implements MigrationInterface {
  name = 'CreateNotificationLogsTable1741776001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notification_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'todoId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            isNullable: false
          },
          {
            name: 'referenceDate',
            type: 'date',
            isNullable: false
          },
          {
            name: 'sentAt',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      true
    )

    await queryRunner.createIndex(
      'notification_logs',
      new TableIndex({
        name: 'IDX_notify_log_todo_type_date',
        columnNames: ['todoId', 'type', 'referenceDate']
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('notification_logs', 'IDX_notify_log_todo_type_date')
    await queryRunner.dropTable('notification_logs')
  }
}
