export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  statusCode: number
  message: string
  data: {
    user: User
    access_token: string
    refresh_token: string
  }
}

export interface UpdateProfilePayload {
  name?: string
  oldPassword?: string
  newPassword?: string
}

export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data: T
}
