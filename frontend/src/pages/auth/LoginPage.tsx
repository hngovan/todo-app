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
import { loginSchema } from '@/schemas/auth/login.schema'
import type { LoginFormData } from '@/schemas/auth/login.schema'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authApi.login(data)
      login(res.data.user, res.data.access_token, res.data.refresh_token)
      toast.success(t('loginSuccess'))
      navigate(ROUTES.TODOS.LIST, { replace: true })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginSubtitle')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {t(errors.password.message!)}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {t('login')}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            {t('noAccount')}{' '}
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {t('signUp')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
