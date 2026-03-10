import axiosInstance from '@/lib/axios'

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
  }
}
