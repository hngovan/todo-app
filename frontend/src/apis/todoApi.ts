import { API_ENDPOINTS } from '@/constants/api-endpoints.constants'
import axiosInstance from '@/lib/axios'
import type {
  ApiResponse,
  Todo,
  TodoFilter,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoSort
} from '@/types'

export const todoApi = {
  getAll: async (params?: {
    filter?: TodoFilter
    search?: string
    sort?: TodoSort
  }): Promise<ApiResponse<Todo[]>> => {
    const { data } = await axiosInstance.get<ApiResponse<Todo[]>>(
      API_ENDPOINTS.TODOS.BASE,
      { params }
    )
    return data
  },

  getOne: async (id: string): Promise<ApiResponse<Todo>> => {
    const { data } = await axiosInstance.get<ApiResponse<Todo>>(
      API_ENDPOINTS.TODOS.BY_ID(id)
    )
    return data
  },

  create: async (payload: CreateTodoPayload): Promise<ApiResponse<Todo>> => {
    const { data } = await axiosInstance.post<ApiResponse<Todo>>(
      API_ENDPOINTS.TODOS.BASE,
      payload
    )
    return data
  },

  update: async (
    id: string,
    payload: UpdateTodoPayload
  ): Promise<ApiResponse<Todo>> => {
    const { data } = await axiosInstance.patch<ApiResponse<Todo>>(
      API_ENDPOINTS.TODOS.BY_ID(id),
      payload
    )
    return data
  },

  delete: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean; id: string }>> => {
    const { data } = await axiosInstance.delete<
      ApiResponse<{ success: boolean; id: string }>
    >(API_ENDPOINTS.TODOS.BY_ID(id))
    return data
  },

  toggleComplete: async (
    id: string,
    completed: boolean
  ): Promise<ApiResponse<Todo>> => {
    const { data } = await axiosInstance.patch<ApiResponse<Todo>>(
      API_ENDPOINTS.TODOS.TOGGLE(id),
      { completed }
    )
    return data
  },

  uploadAttachments: async (
    id: string,
    files: File[]
  ): Promise<ApiResponse<Todo>> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const { data } = await axiosInstance.post<ApiResponse<Todo>>(
      API_ENDPOINTS.TODOS.ATTACHMENTS(id),
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
