import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { authApi } from '@/apis/authApi'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/constants/routes.constants'
import { registerSchema } from '@/schemas/auth/register.schema'
import type { RegisterFormData } from '@/schemas/auth/register.schema'
import { useAuthStore } from '@/stores/auth.store'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password
      })
      login(res.data.user, res.data.access_token, res.data.refresh_token)
      toast.success(t('registerSuccess'))
      navigate(ROUTES.TODOS.LIST, { replace: true })
    } catch {
      toast.error(t('registerError'))
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('registerTitle')}
        </CardTitle>
        <CardDescription>{t('registerSubtitle')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('namePlaceholder')}
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-destructive text-sm">
                {t(errors.name.message!)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-sm">
                {t(errors.email.message!)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {t(errors.password.message!)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('passwordPlaceholder')}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {t(errors.confirmPassword.message!)}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {t('register')}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            {t('hasAccount')}{' '}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {t('signIn')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
