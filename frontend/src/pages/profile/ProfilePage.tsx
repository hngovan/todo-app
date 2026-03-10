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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getImageUrl } from '@/lib/storage'
import { profileSchema } from '@/schemas/profile/profile.schema'
import type { ProfileFormData } from '@/schemas/profile/profile.schema'
import { useAuthStore } from '@/stores/auth.store'

export default function ProfilePage() {
  const { t } = useTranslation('profile')
  const user = useAuthStore(s => s.user)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
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
      reset({ name: data.name, oldPassword: '', newPassword: '' })
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" autoComplete="name" {...register('name')} />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {t(errors.name.message!, { ns: 'auth' })}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-medium">{t('changePassword')}</h4>
              <p className="text-muted-foreground text-xs">
                {t('changePasswordDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oldPassword">{t('oldPassword')}</Label>
              <Input
                id="oldPassword"
                type="password"
                autoComplete="current-password"
                {...register('oldPassword')}
              />
              {errors.oldPassword && (
                <p className="text-destructive text-sm">
                  {t(errors.oldPassword.message!, { ns: 'auth' })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm">
                  {t(errors.newPassword.message!, { ns: 'auth' })}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !isDirty}
            >
              {t('saveChanges')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
