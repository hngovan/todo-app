import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('validation.emailInvalid'),
  password: z.string().min(6, 'validation.passwordMin')
})

export type LoginFormData = z.infer<typeof loginSchema>
