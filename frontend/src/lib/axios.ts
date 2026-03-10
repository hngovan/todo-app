import axios from 'axios'
import { toast } from 'sonner'

import { API_ENDPOINTS } from '@/constants/api-endpoints.constants'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'

import type { AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

axiosInstance.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Attach current language to Accept-Language header for backend i18n
    if (i18n.language) {
      config.headers['Accept-Language'] = i18n.language
    }

    return config
  },
  error => Promise.reject(error)
)

// Response interceptor: auto-refresh on 401
let isRefreshing = false
let refreshQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach(p => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  refreshQueue = []
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
      error.config

    const isLoginRequest = originalRequest?.url?.includes(
      API_ENDPOINTS.AUTH.LOGIN
    )
    const is401 = error.response?.status === 401

    // Show error toast for non-401 errors (or login 401 = wrong password)
    if (!is401 || isLoginRequest) {
      const apiMessage: string | undefined = error.response?.data?.message
      if (apiMessage) {
        toast.error(apiMessage)
      }
    }

    if (!is401 || isLoginRequest || originalRequest._retry) {
      if (is401 && !isLoginRequest) {
        useAuthStore.getState().logout()
      }
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: token => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`
            }
            resolve(axiosInstance(originalRequest))
          },
          reject
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) throw new Error('No refresh token')

      // Use plain axios to avoid interceptor loop
      const { data } = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refresh_token: refreshToken }
      )

      const newAccessToken: string = data.data.access_token
      const newRefreshToken: string = data.data.refresh_token
      const user = useAuthStore.getState().user!

      useAuthStore.getState().login(user, newAccessToken, newRefreshToken)
      processQueue(null, newAccessToken)

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`
      }
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
