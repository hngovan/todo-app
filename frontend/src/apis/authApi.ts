import { API_ENDPOINTS } from '@/constants/api-endpoints.constants'
import axiosInstance from '@/lib/axios'
import type { AuthResponse } from '@/types'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload
    )
    return data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    )
    return data
  },

  getMe: async () => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.AUTH.ME)
    return data
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken }
    )
    return data
  }
}
