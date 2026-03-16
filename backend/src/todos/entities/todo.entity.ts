import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Category } from '../../categories/entities/category.entity'
import { PRIORITY_DEFAULT } from '../../common/constants/todo.constants'
import type { Priority } from '../../common/constants/todo.constants'

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

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: string | null

  @Column({ type: 'smallint', default: PRIORITY_DEFAULT })
  priority: Priority

  @Column({ type: 'simple-array', nullable: true, default: null })
  images: string[] | null

  @Column()
  userId: string

  @ManyToOne(() => User, user => user.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: true })
  categoryId: string | null

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
