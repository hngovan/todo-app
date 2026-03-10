import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(1, 'validation.nameRequired').max(100),
    email: z.email('validation.emailInvalid'),
    password: z.string().min(6, 'validation.passwordMin'),
    confirmPassword: z.string().min(6, 'validation.passwordMin')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'validation.passwordMatch',
    path: ['confirmPassword']
  })

export type RegisterFormData = z.infer<typeof registerSchema>
