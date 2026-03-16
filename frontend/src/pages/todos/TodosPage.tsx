import { Search, Plus, FolderOpen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { categoryApi } from '@/apis/categoryApi'
import { todoApi } from '@/apis/todoApi'
import CategoryManagerDialog from '@/components/category/CategoryManagerDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TodoFormDialog from '@/components/todo/TodoFormDialog'
import TodoItem from '@/components/todo/TodoItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import type {
  Category,
  CreateCategoryPayload,
  CreateTodoPayload,
  Todo,
  TodoFilter,
  TodoSort,
  UpdateCategoryPayload,
  UpdateTodoPayload
} from '@/types'

const FILTER_KEYS: TodoFilter[] = ['all', 'active', 'completed']

export default function TodosPage() {
  const { t } = useTranslation('common')
  const [searchParams, setSearchParams] = useSearchParams()

  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  const filter = (searchParams.get('filter') as TodoFilter) || 'all'
  const sort = (searchParams.get('sort') as TodoSort) || 'createdAt_desc'
  const searchInput = searchParams.get('search') || ''

  const [search, setSearch] = useState(searchInput)
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    setSearchParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const setFilter = (val: TodoFilter) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', val)
    setSearchParams(params, { replace: true })
  }

  const setSort = (val: TodoSort) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', val)
    setSearchParams(params, { replace: true })
  }

  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)

  // Category management
  const [managerOpen, setManagerOpen] = useState(false)

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.getAll()
      setCategories(res.data)
    } catch {
      /* quiet */
    }
  }, [])

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await todoApi.getAll({
        filter: filter === 'all' ? undefined : filter,
        search: debouncedSearch.trim() || undefined,
        sort
      })
      setTodos(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [filter, sort, debouncedSearch])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // ── Derived state ────────────────────────────────────────────────────────

  const completedCount = todos.filter(td => td.completed).length
  const progress = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0

  // ── Category CRUD ────────────────────────────────────────────────────────

  const handleCategorySave = async (
    payload: CreateCategoryPayload | UpdateCategoryPayload,
    editingCategoryId?: string
  ) => {
    if (editingCategoryId) {
      const res = await categoryApi.update(
        editingCategoryId,
        payload as UpdateCategoryPayload
      )
      setCategories(prev =>
        prev.map(c => (c.id === res.data.id ? res.data : c))
      )
      setTodos(prev =>
        prev.map(td =>
          td.categoryId === res.data.id ? { ...td, category: res.data } : td
        )
      )
      toast.success(t('categoryUpdated'))
    } else {
      const res = await categoryApi.create(payload as CreateCategoryPayload)
      setCategories(prev => [...prev, res.data])
      toast.success(t('categoryCreated'))
    }
  }

  const handleCategoryDelete = async (category: Category) => {
    try {
      await categoryApi.delete(category.id)
      setCategories(prev => prev.filter(c => c.id !== category.id))
      setTodos(prev =>
        prev.map(td =>
          td.categoryId === category.id
            ? { ...td, categoryId: null, category: null }
            : td
        )
      )
      toast.success(t('categoryDeleted', 'Category deleted'))
    } catch (error) {
      console.error(error)
    }
  }

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleCreate = async (
    payload: CreateTodoPayload | UpdateTodoPayload,
    files?: File[]
  ) => {
    let res = await todoApi.create(payload as CreateTodoPayload)
    if (files && files.length > 0) {
      res = await todoApi.uploadAttachments(res.data.id, files)
    }
    setTodos(prev => [res.data, ...prev])
    toast.success(t('todoCreated'))
  }

  const handleUpdate = async (
    payload: CreateTodoPayload | UpdateTodoPayload,
    files?: File[]
  ) => {
    if (!editingTodo) return
    let res = await todoApi.update(editingTodo.id, payload as UpdateTodoPayload)
    if (files && files.length > 0) {
      res = await todoApi.uploadAttachments(res.data.id, files)
    }
    setTodos(prev =>
      prev.map(td => (td.id === res.data.id ? { ...td, ...res.data } : td))
    )
    toast.success(t('todoUpdated'))
  }

  const handleToggle = async (todo: Todo) => {
    try {
      const res = await todoApi.toggleComplete(todo.id, !todo.completed)
      setTodos(prev => prev.map(td => (td.id === res.data.id ? res.data : td)))
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!deletingTodo) return
    await todoApi.delete(deletingTodo.id)
    setTodos(prev => prev.filter(td => td.id !== deletingTodo.id))
    setDeletingTodo(null)
    toast.success(t('todoDeleted'))
  }

  const openCreate = () => {
    setEditingTodo(undefined)
    setFormOpen(true)
  }

  const openEdit = async (todo: Todo) => {
    try {
      const res = await todoApi.getOne(todo.id)
      setEditingTodo(res.data)
      setFormOpen(true)
    } catch (error) {
      console.error(error)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Progress card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-base font-medium">
            {t('tasksCompleted', {
              completed: completedCount,
              total: todos.length
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-[width,background-color] duration-500 ${
                progress === 100 ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search + Add + Categories */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              autoComplete="off"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={t('manageCategories')}
            onClick={() => setManagerOpen(true)}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          <Button onClick={openCreate} size="icon" aria-label={t('addTodo')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter and Sort tabs */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="bg-muted flex flex-1 gap-1 rounded-lg border p-1 shadow-xs">
            {FILTER_KEYS.map(key => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(key)}
                className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
                  filter === key ? 'shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t(`filter${key.charAt(0).toUpperCase() + key.slice(1)}`)}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={val => setSort(val as TodoSort)}>
            <SelectTrigger className="w-full sm:w-[150px]" size="md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">
                {t('sortCreatedAtDesc')}
              </SelectItem>
              <SelectItem value="createdAt_asc">
                {t('sortCreatedAtAsc')}
              </SelectItem>
              <SelectItem value="priority_desc">
                {t('sortPriorityDesc')}
              </SelectItem>
              <SelectItem value="priority_asc">
                {t('sortPriorityAsc')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : todos.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {t('noTodos')}
        </p>
      ) : (
        <div className="space-y-2">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={setDeletingTodo}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TodoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={editingTodo ? handleUpdate : handleCreate}
        initial={editingTodo}
        categories={categories}
      />
      <CategoryManagerDialog
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        categories={categories}
        onSave={handleCategorySave}
        onDelete={handleCategoryDelete}
      />
      <ConfirmDialog
        open={!!deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDelete}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDesc')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />
    </>
  )
}
