import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { authApi } from '@/apis/authApi'
import { STORAGE_KEYS } from '@/constants/storage.constants'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          /* ignore - still clear state */
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: STORAGE_KEYS.AUTH_STORAGE,
      // Only persist user + token (not the actions)
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
