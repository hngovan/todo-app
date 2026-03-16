export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  USERS: {
    ME: '/users/me',
    ME_AVATAR: '/users/me/avatar'
  },
  TODOS: {
    BASE: '/todos',
    BY_ID: (id: string) => `/todos/${id}`,
    TOGGLE: (id: string) => `/todos/${id}/toggle`,
    ATTACHMENTS: (id: string) => `/todos/${id}/attachments`
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`
  },
  STORAGE: {
    DOWNLOAD_URL: '/storage/download-url'
  }
} as const
