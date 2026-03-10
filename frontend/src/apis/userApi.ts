import { API_ENDPOINTS } from '@/constants/api-endpoints.constants'
import axiosInstance from '@/lib/axios'
import type { ApiResponse, User, UpdateProfilePayload } from '@/types'

export const userApi = {
  getMe: async (): Promise<ApiResponse<User>> => {
    const { data } = await axiosInstance.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.ME
    )
    return data
  },

  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<User>> => {
    const { data } = await axiosInstance.patch<ApiResponse<User>>(
      API_ENDPOINTS.USERS.ME,
      payload
    )
    return data
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<User>> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await axiosInstance.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.ME_AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data
  }
}
