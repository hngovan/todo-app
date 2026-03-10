import { LogOut, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate } from 'react-router-dom'

import ConfirmDialog from '@/components/common/ConfirmDialog'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants'
import { getImageUrl } from '@/lib/storage'
import { useAuthStore } from '@/stores/auth.store'

export default function DefaultLayout() {
  const { t } = useTranslation('common')
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    setIsLogoutDialogOpen(false)
    logout()
  }

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span
            onClick={() => navigate(ROUTES.TODOS.LIST)}
            className="cursor-pointer text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            {t('appName')}
          </span>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="ring-offset-background focus-visible:ring-ring rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                <Avatar className="h-8 w-8 border transition-opacity hover:opacity-80">
                  {user?.avatarUrl && (
                    <AvatarImage
                      src={getImageUrl(user.avatarUrl)}
                      alt={user.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="text-xs">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user?.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>
                    {t('profile', { ns: 'common', defaultValue: 'Profile' })}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout', { ns: 'auth' })}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <Outlet />
      </main>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title={t('logoutConfirmTitle')}
        description={t('logoutConfirmDesc')}
        confirmText={t('logoutConfirmTitle')}
        cancelText={t('cancel')}
      />
    </div>
  )
}
