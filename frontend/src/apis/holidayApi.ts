import axiosInstance from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface Holiday {
  id: string
  date: string
  name: string
  localName: string
  countryCode: string
}

export const holidayApi = {
  getHolidays: (year: number, countryCode = 'VN') =>
    axiosInstance.get<ApiResponse<Holiday[]>>(`/holidays/${year}`, {
      params: { countryCode }
    })
}
