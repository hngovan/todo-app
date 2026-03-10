import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Exclude } from 'class-transformer'
import { ApiHideProperty } from '@nestjs/swagger'
import { Todo } from '@/todos/entities/todo.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ unique: true, length: 255 })
  email: string

  @ApiHideProperty()
  @Exclude()
  @Column()
  password: string

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  avatarUrl: string | null

  @OneToMany(() => Todo, todo => todo.user, { cascade: true })
  todos: Todo[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
