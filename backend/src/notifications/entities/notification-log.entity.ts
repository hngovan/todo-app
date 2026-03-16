import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import type { NotificationType } from '../../common/constants/notification.constants'

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Index()
  todoId: string

  @Column({
    type: 'varchar',
    length: 20
  })
  type: NotificationType

  @Column({ type: 'date' })
  @Index()
  referenceDate: string // The date for which this notification was sent (e.g. tomorrowStr)

  @CreateDateColumn()
  sentAt: Date
}
