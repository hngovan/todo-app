import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '@/users/entities/user.entity'
import { Priority } from '@/common/constants/todo.constants'

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ default: false })
  completed: boolean

  @Column({ type: 'date', nullable: true })
  dueDate: string | null

  @Column({ type: 'varchar', length: 10, default: 'medium' })
  priority: Priority

  @Column({ type: 'simple-array', nullable: true, default: null })
  images: string[] | null

  @Column()
  userId: string

  @ManyToOne(() => User, user => user.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
