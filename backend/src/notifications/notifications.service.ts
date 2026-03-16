import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import * as nodemailer from 'nodemailer'
import pLimit from 'p-limit'
import { LessThan, Repository, In } from 'typeorm'

import { EMAIL_TEMPLATES, NOTIFICATION_CONSTRAINTS } from '@/common/constants/notification.constants'
import { Todo } from '@/todos/entities/todo.entity'
import { NotificationLog } from './entities/notification-log.entity'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private transporter: nodemailer.Transporter

  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @InjectRepository(NotificationLog) private readonly logRepository: Repository<NotificationLog>,
    private readonly configService: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 1025), // e.g. Mailpit default
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', '')
      }
    })
  }

  /**
   * Helper to get a stable "local date string" for the server's current time.
   * Avoids UTC offset issues of toISOString() for day-based reminders.
   */
  private getLocalDateString(date: Date = new Date()): string {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    return localDate.toISOString().split('T')[0]
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDueTomorrow() {
    this.logger.log('Running daily 8 AM cron for due tomorrow tasks...')

    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const referenceDate = this.getLocalDateString(tomorrow)

      // Find all tasks due tomorrow
      const todos = await this.todoRepository.find({
        where: { completed: false, dueDate: referenceDate },
        relations: ['user']
      })

      await this.processReminders(todos, 'due_tomorrow', referenceDate)
    } catch (error) {
      this.logger.error('Failed to process due tomorrow reminders:', error)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleOverdue() {
    this.logger.log('Running daily 9 AM cron for overdue tasks...')

    try {
      const referenceDate = this.getLocalDateString()

      // Find all overdue tasks (due before today local)
      const todos = await this.todoRepository.find({
        where: { completed: false, dueDate: LessThan(referenceDate) },
        relations: ['user']
      })

      await this.processReminders(todos, 'overdue', referenceDate)
    } catch (error) {
      this.logger.error('Failed to process overdue reminders:', error)
    }
  }

  private async processReminders(todos: Todo[], type: 'due_tomorrow' | 'overdue', referenceDate: string) {
    if (todos.length === 0) return

    // 1. Filter out those we already sent today (idempotency)
    const existingLogs = await this.logRepository.find({
      where: {
        todoId: In(todos.map(t => t.id)),
        type,
        referenceDate
      },
      select: ['todoId']
    })
    const sentIds = new Set(existingLogs.map(l => l.todoId))
    const toProcess = todos.filter(t => !sentIds.has(t.id) && t.user?.notifyEmail)

    if (toProcess.length === 0) {
      this.logger.log(`No new reminders of type ${type} to send for ${referenceDate}`)
      return
    }

    this.logger.log(`Sending ${toProcess.length} ${type} reminders...`)

    // 2. Rate limiting
    const limit = pLimit(NOTIFICATION_CONSTRAINTS.PARALLEL_EMAILS)
    const template = type === 'due_tomorrow' ? EMAIL_TEMPLATES.DUE_TOMORROW : EMAIL_TEMPLATES.OVERDUE

    const emailPromises = toProcess.map(todo =>
      limit(async () => {
        try {
          const subject = template.subject(todo.title)
          const body = template.body(todo.user.name, todo.title, todo.dueDate!)

          const success = await this.sendEmail(todo.user.email, subject, body)
          if (success) {
            await this.logRepository.save({
              todoId: todo.id,
              type,
              referenceDate
            })
          }
        } catch (err) {
          this.logger.error(`Error processing reminder for todo ${todo.id}:`, err)
        }
      })
    )

    await Promise.allSettled(emailPromises)
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@todoapp.local')
    try {
      await this.transporter.sendMail({ from, to, subject, text })
      this.logger.log(`Sent email to ${to}: ${subject}`)
      return true
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error)
      return false
    }
  }
}
