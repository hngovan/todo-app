import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

export const storageApi = {
  /**
   * Get a file Blob through the backend proxy
   */
  downloadFile: async (key: string) => {
    const response = await axiosInstance.get('/storage/download', {
      params: { key },
      responseType: 'blob'
    })
    return response.data as Blob
  },

  /**
   * Upload a general file
   */
  uploadFile: async (
    folder: 'avatars' | 'todos' | 'categories',
    file: File
  ): Promise<ApiResponse<{ key: string; url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await axiosInstance.post<
      ApiResponse<{ key: string; url: string }>
    >('/storage/upload', formData, {
      params: { folder },
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }
}
