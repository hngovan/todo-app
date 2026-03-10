import { z } from 'zod'

export const profileSchema = z
  .object({
    name: z.string().min(1, 'validation.nameRequired').max(100),
    oldPassword: z.string().optional().or(z.literal('')),
    newPassword: z.string().optional().or(z.literal(''))
  })
  .superRefine((data, ctx) => {
    const { oldPassword, newPassword } = data

    if (!oldPassword && !newPassword) return

    if (oldPassword && !newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'validation.passwordRequired'
      })
      return
    }

    if (!oldPassword && newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['oldPassword'],
        message: 'validation.oldPasswordRequired'
      })
      return
    }

    if (oldPassword && oldPassword.length < 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['oldPassword'],
        message: 'validation.passwordMin'
      })
    }

    if (newPassword && newPassword.length < 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'validation.passwordMin'
      })
    }

    if (oldPassword === newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'validation.passwordMustDifferent'
      })
    }
  })

export type ProfileFormData = z.infer<typeof profileSchema>
