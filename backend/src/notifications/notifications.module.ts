import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Todo } from '@/todos/entities/todo.entity'
import { NotificationLog } from './entities/notification-log.entity'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [TypeOrmModule.forFeature([Todo, NotificationLog]), ScheduleModule.forRoot()],
  providers: [NotificationsService]
})
export class NotificationsModule {}
