export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  images: string[] | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTodoPayload {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate: string // required
}

export interface UpdateTodoPayload {
  title?: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
  images?: string[] | null
}

// Filter type for todo list
export type TodoFilter = 'all' | 'active' | 'completed'

// Sort type for todo list
export type TodoSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'priority_desc'
  | 'priority_asc'

// Form values for create/edit todo dialog
export interface TodoFormValues {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
}
