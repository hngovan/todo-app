import { z } from 'zod'

export const todoSchema = z.object({
  title: z.string().min(1, 'validation.titleRequired').max(100),
  description: z.string(),
  priority: z.number().min(1).max(10),
  dueDate: z.string().min(1, 'validation.dueDateRequired'),
  dueTime: z.string().min(1, 'validation.dueTimeRequired'),
  categoryId: z.string().nullable()
})

export type TodoFormValues = z.infer<typeof todoSchema>
