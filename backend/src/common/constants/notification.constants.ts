export const EMAIL_TEMPLATES = {
  DUE_TOMORROW: {
    subject: (title: string) => `Reminder: Task "${title}" is due tomorrow`,
    body: (name: string, title: string, dueDate: string) =>
      `Hi ${name},\n\nThis is a reminder that your task "${title}" is due tomorrow, ${dueDate}.\n\nBest,\nTodo App Team`
  },
  OVERDUE: {
    subject: (title: string) => `Notice: Task "${title}" is overdue`,
    body: (name: string, title: string, dueDate: string) =>
      `Hi ${name},\n\nThis is a notice that your task "${title}" was due on ${dueDate} and is now overdue.\n\nBest,\nTodo App Team`
  }
} as const

export type NotificationType = 'due_tomorrow' | 'overdue'

export const NOTIFICATION_CONSTRAINTS = {
  PARALLEL_EMAILS: 10
} as const
