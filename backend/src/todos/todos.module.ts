import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { BadRequestException } from '@nestjs/common'
import { Todo } from './entities/todo.entity'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'
import { TODO_CONSTRAINTS, ALLOWED_MIME_TYPES } from '@/common/constants/todo.constants'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: TODO_CONSTRAINTS.MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        const allowed = (ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)
        if (!allowed) {
          cb(new BadRequestException('messages.error.invalid_file_type'), false)
        } else {
          cb(null, true)
        }
      }
    })
  ],
  controllers: [TodosController],
  providers: [TodosService]
})
export class TodosModule {}
