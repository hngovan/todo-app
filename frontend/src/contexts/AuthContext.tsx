import { createContext, use, useState, useCallback } from 'react'

import { STORAGE_KEYS } from '@/constants'
import type { User } from '@/types'

import type { ReactNode } from 'react'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isLoading] = useState(false)

  const login = useCallback((newUser: User, token: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setUser(null)
  }, [])

  return (
    <AuthContext
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
