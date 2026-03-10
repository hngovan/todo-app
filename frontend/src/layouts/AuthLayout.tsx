import { Outlet } from 'react-router-dom'

import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function AuthLayout() {
  return (
    <div className="bg-background relative flex min-h-svh items-center justify-center px-4">
      {/* Controls top-right */}
      <div className="absolute top-3 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  )
}
