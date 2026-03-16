export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null
  priority: number
  images: string[] | null
  userId: string
  categoryId: string | null
  category: Category | null
  createdAt: string
  updatedAt: string
}

export interface CreateTodoPayload {
  title: string
  description?: string
  priority?: number
  dueDate: string
  categoryId?: string | null
}

export interface UpdateTodoPayload {
  title?: string
  description?: string
  completed?: boolean
  priority?: number
  dueDate?: string | null
  images?: string[] | null
  categoryId?: string | null
}

// Filter type for todo list
export type TodoFilter = 'all' | 'active' | 'completed'

// Sort type for todo list
export type TodoSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'priority_desc'
  | 'priority_asc'
  | 'dueDate_desc'
  | 'dueDate_asc'

// Form values for create/edit todo dialog
export interface TodoFormValues {
  title: string
  description: string
  priority: number
  dueDate: string
  dueTime: string
  categoryId: string | null
}

// Category
export interface Category {
  id: string
  name: string
  icon: string | null
  color: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryPayload {
  name: string
  icon?: string
  color?: string
}

export interface UpdateCategoryPayload {
  name?: string
  icon?: string
  color?: string
}
