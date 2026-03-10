import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/users/entities/user.entity'
import { Todo } from '@/todos/entities/todo.entity'

// best-practice: arch-feature-modules, db-use-migrations
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [User, Todo],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true, // auto-run pending migrations on app start
        synchronize: false, // never synchronize — use migrations (db-use-migrations)
        logging: config.get<string>('NODE_ENV') === 'development'
      })
    })
  ]
})
export class DatabaseModule {}
