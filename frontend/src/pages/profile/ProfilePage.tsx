import { zodResolver } from '@hookform/resolvers/zod'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { userApi } from '@/apis/userApi'
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
import { getImageUrl } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { profileSchema } from '@/schemas/profile/profile.schema'
import type { ProfileFormData } from '@/schemas/profile/profile.schema'
import { useAuthStore } from '@/stores/auth.store'

export default function ProfilePage() {
  const { t } = useTranslation('profile')
  const user = useAuthStore(s => s.user)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormData>({
    mode: 'onChange',
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      oldPassword: '',
      newPassword: ''
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: {
        name: string
        oldPassword?: string
        newPassword?: string
      } = { name: data.name }
      if (data.oldPassword && data.newPassword) {
        payload.oldPassword = data.oldPassword
        payload.newPassword = data.newPassword
      }
      const res = await userApi.updateProfile(payload)
      useAuthStore.setState({ user: res.data })
      // Update defaultValues → isDirty becomes false → Save button disables
      form.reset({ name: data.name, oldPassword: '', newPassword: '' })
      toast.success(t('profileUpdated'))
    } catch (error) {
      console.error(error)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      const res = await userApi.uploadAvatar(file)
      useAuthStore.setState({ user: res.data })

      toast.success(t('avatarUpdated'))
    } catch (error) {
      console.error(error)
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('avatar')}</CardTitle>
          <CardDescription>{t('avatarDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="bg-muted h-16 w-16 overflow-hidden rounded-full">
            {user?.avatarUrl ? (
              <img
                src={getImageUrl(user.avatarUrl)}
                alt="Avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xl font-medium">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <Button
              variant="outline"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUploading ? t('uploading') : t('uploadAvatar')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
          <CardDescription>{t('profileDesc')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" maxLength={100} {...field} />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <span
                        className={cn(
                          'text-xs transition-colors',
                          field.value.length >= 100
                            ? 'font-bold text-orange-500'
                            : field.value.length > 80
                              ? 'text-orange-400'
                              : 'text-muted-foreground'
                        )}
                      >
                        {field.value.length}/100
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-2 pt-4">
                <h4 className="text-sm font-medium">{t('changePassword')}</h4>
                <p className="text-muted-foreground text-xs">
                  {t('changePasswordDesc')}
                </p>
              </div>

              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('oldPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {t('saveChanges')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
