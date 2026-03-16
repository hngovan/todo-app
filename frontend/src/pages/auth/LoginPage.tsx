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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes.constants'
import { loginSchema } from '@/schemas/auth/login.schema'
import type { LoginFormData } from '@/schemas/auth/login.schema'
import { useAuthStore } from '@/stores/auth.store'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const form = useForm<LoginFormData>({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              loading={form.formState.isSubmitting}
            >
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
      </Form>
    </Card>
  )
}
