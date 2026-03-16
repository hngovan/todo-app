import { API_ENDPOINTS } from '@/constants/api-endpoints.constants'
import axiosInstance from '@/lib/axios'
import type {
  ApiResponse,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '@/types'

export const categoryApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const { data } = await axiosInstance.get<ApiResponse<Category[]>>(
      API_ENDPOINTS.CATEGORIES.BASE
    )
    return data
  },

  create: async (
    payload: CreateCategoryPayload
  ): Promise<ApiResponse<Category>> => {
    const { data } = await axiosInstance.post<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORIES.BASE,
      payload
    )
    return data
  },

  update: async (
    id: string,
    payload: UpdateCategoryPayload
  ): Promise<ApiResponse<Category>> => {
    const { data } = await axiosInstance.patch<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORIES.BY_ID(id),
      payload
    )
    return data
  },

  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    const { data } = await axiosInstance.delete<
      ApiResponse<{ success: boolean }>
    >(API_ENDPOINTS.CATEGORIES.BY_ID(id))
    return data
  }
}
