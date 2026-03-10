import { Navigate, Outlet } from 'react-router-dom'

import { ROUTES } from '@/constants/routes.constants'
import { useAuthStore } from '@/stores/auth.store'

export default function GuestRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.TODOS.LIST} replace />
  }

  return <Outlet />
}
