import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n'
import * as path from 'path'

import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TodosModule } from './todos/todos.module'
import { DatabaseModule } from './database/database.module'
import { StorageModule } from './storage/storage.module'
import { envValidationSchema } from './config/env.validation'

@Module({
  imports: [
    // Config with Joi validation (best-practice: devops-use-config-module)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      cache: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false
      }
    }),

    // i18n configuration
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      resolvers: [AcceptLanguageResolver]
    }),

    // MinIO storage (global — injectable in all feature modules)
    StorageModule,

    // Database (best-practice: arch-feature-modules, db-use-migrations)
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TodosModule
  ]
})
export class AppModule {}
