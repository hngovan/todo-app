import { Navigate, Outlet } from 'react-router-dom'

import { ROUTES } from '@/constants/routes.constants'
import { useAuthStore } from '@/stores/auth.store'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  return <Outlet />
}
