import { lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

// no lazy loading for auth pages to avoid flickering (entry point)
import { ROUTES } from '@/constants'
import { withLoading } from '@/hocs/withLoading.hoc'
import AuthLayout from '@/layouts/AuthLayout'
import DefaultLayout from '@/layouts/DefaultLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import GuestRoute from './guards/GuestRoute'
import ProtectedRoute from './guards/ProtectedRoute'

// Lazy-loaded pages
const TodosPageLazy = lazy(() => import('@/pages/todos/TodosPage'))
const TodosPage = withLoading(TodosPageLazy)

const ProfilePageLazy = lazy(() => import('@/pages/profile/ProfilePage'))
const ProfilePage = withLoading(ProfilePageLazy)

const router = createBrowserRouter([
  // Redirect root → /todos
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.TODOS.LIST} replace />
  },

  // Auth routes (guest only)
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.AUTH.LOGIN, element: <LoginPage /> },
          { path: ROUTES.AUTH.REGISTER, element: <RegisterPage /> }
        ]
      }
    ]
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          { path: ROUTES.TODOS.LIST, element: <TodosPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> }
        ]
      }
    ]
  },

  // Catch-all → /todos
  {
    path: '*',
    element: <Navigate to={ROUTES.TODOS.LIST} replace />
  }
])

export const AppRouter: React.FC = () => <RouterProvider router={router} />
