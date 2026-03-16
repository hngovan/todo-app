/**
 * TypeORM CLI DataSource — used by migration commands only.
 * Dev:  pnpm migration:run      (typeorm-ts-node-commonjs, uses .ts files)
 * Prod: pnpm migration:run:prod (typeorm binary, uses dist/*.js files)
 */
import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Todo } from '../todos/entities/todo.entity'
import { Category } from '../categories/entities/category.entity'
import { Holiday } from '../holidays/entities/holiday.entity'

const isProd = process.env.NODE_ENV === 'production'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: isProd ? ['dist/**/*.entity.js'] : [User, Todo, Category, Holiday],
  migrations: isProd ? ['dist/database/migrations/*.js'] : ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true
})
