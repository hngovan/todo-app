import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  User as UserIcon,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

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

const navItems = [
  { label: 'dashboard', icon: BarChart3, to: ROUTES.DASHBOARD },
  { label: 'todos', icon: CheckSquare, to: ROUTES.TODOS.LIST },
  { label: 'calendar', icon: CalendarDays, to: ROUTES.CALENDAR }
] as const

function SidebarNav({
  collapsed,
  onClose
}: {
  collapsed?: boolean
  onClose?: () => void
}) {
  const { t } = useTranslation('common')

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          title={collapsed ? t(label) : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            } ${collapsed ? 'justify-center px-2' : ''}`
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t(label)}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

export default function DefaultLayout() {
  const { t } = useTranslation('common')
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  const handleLogout = () => {
    setIsLogoutDialogOpen(false)
    logout()
  }

  return (
    <div className="bg-background flex min-h-svh">
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`border-border bg-card sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-300 lg:flex ${
          desktopCollapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Logo — fixed at top */}
        <div
          className={`flex h-14 shrink-0 items-center border-b px-3 ${
            desktopCollapsed ? 'justify-center' : 'justify-between gap-2'
          }`}
        >
          {!desktopCollapsed && (
            <span
              className="cursor-pointer truncate text-base font-bold tracking-tight transition-opacity hover:opacity-80"
              onClick={() => navigate(ROUTES.TODOS.LIST)}
            >
              {t('appName')}
            </span>
          )}
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setDesktopCollapsed(prev => !prev)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground shrink-0 rounded-md p-1.5 transition-colors"
            aria-label={
              desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {desktopCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav links — scrollable middle */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav collapsed={desktopCollapsed} />
        </div>

        {/* User section — fixed at bottom */}
        <div
          className={`shrink-0 border-t p-2 ${desktopCollapsed ? 'flex justify-center' : ''}`}
        >
          {desktopCollapsed ? (
            /* Collapsed: just avatar as trigger */
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
              <DropdownMenuContent side="right" align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm leading-none font-medium">
                    {user?.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-none">
                    {user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
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
          ) : (
            /* Expanded: full user card */
            <DropdownMenu>
              <DropdownMenuTrigger className="ring-offset-background focus-visible:ring-ring w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                <div className="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0 border">
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
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium">{user?.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-52">
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
                  <span>{t('profile')}</span>
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
          )}
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`border-border bg-card fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r shadow-xl transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo — fixed at top */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <span
            className="cursor-pointer text-base font-bold tracking-tight"
            onClick={() => {
              navigate(ROUTES.TODOS.LIST)
              setMobileSidebarOpen(false)
            }}
          >
            {t('appName')}
          </span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav onClose={() => setMobileSidebarOpen(false)} />
        </div>

        {/* User section — fixed at bottom */}
        <div className="shrink-0 border-t p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar className="h-8 w-8 shrink-0 border">
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
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false)
              navigate(ROUTES.PROFILE)
            }}
            className="text-muted-foreground hover:bg-accent hover:text-foreground mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <UserIcon className="h-4 w-4" />
            {t('profile')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false)
              setIsLogoutDialogOpen(true)
            }}
            className="text-destructive hover:bg-destructive/10 mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('logout', { ns: 'auth' })}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="bg-background/80 border-border sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <span
            className="cursor-pointer text-sm font-bold tracking-tight lg:hidden"
            onClick={() => navigate(ROUTES.TODOS.LIST)}
          >
            {t('appName')}
          </span>

          {/* Desktop spacer */}
          <div className="hidden lg:block" />

          {/* Right controls — language + theme only (avatar is in sidebar) */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

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
