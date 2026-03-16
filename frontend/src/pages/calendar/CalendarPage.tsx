import { format, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { enUS, ja, vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { categoryApi } from '@/apis/categoryApi'
import { holidayApi } from '@/apis/holidayApi'
import { todoApi } from '@/apis/todoApi'
import CategoryBadge from '@/components/category/CategoryBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TodoFormDialog from '@/components/todo/TodoFormDialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { getPriorityColor } from '@/constants/todo.constants'
import { getFileIcon, getFilename, isImageKey } from '@/lib/attachment.utils'
import { getThumbnailUrl } from '@/lib/storage'
import type {
  Category,
  CreateTodoPayload,
  Todo,
  UpdateTodoPayload
} from '@/types'

import type { Locale } from 'date-fns'

type CalendarView = 'month' | 'week' | 'day'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getWeekDays(date: Date) {
  const day = date.getDay()
  const start = new Date(date)
  start.setDate(date.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const DATE_LOCALES: Record<string, Locale> = {
  v: vi,
  e: enUS,
  j: ja
}

interface BackendHoliday {
  date: string
  name: string
  localName: string
}
type HolidayMap = Record<string, BackendHoliday>

const holidayCache = new Map<number, HolidayMap>()

export default function CalendarPage() {
  const { t, i18n } = useTranslation('common')
  const locale = DATE_LOCALES[i18n.language?.[0]] || enUS
  const isVi = i18n.language?.startsWith('vi')
  const [view, setView] = useState<CalendarView>('month')
  const [current, setCurrent] = useState(() => new Date())
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [holidays, setHolidays] = useState<HolidayMap>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined)
  const [presetDate, setPresetDate] = useState<string | undefined>(undefined)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)
  const [dayPopover, setDayPopover] = useState<{
    date: string
    todos: Todo[]
    anchor: { top: number; left: number }
  } | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, catsRes] = await Promise.all([
          todoApi.getAll(),
          categoryApi.getAll()
        ])
        setTodos(todosRes.data)
        setCategories(catsRes.data)
      } catch {
        /* quiet */
      }
    }
    fetchData()
  }, [])

  // Fetch holidays whenever the displayed year changes
  const currentYear = current.getFullYear()
  useEffect(() => {
    const fetchHolidays = async () => {
      if (holidayCache.has(currentYear)) {
        setHolidays(holidayCache.get(currentYear)!)
        return
      }
      try {
        const res = await holidayApi.getHolidays(currentYear)
        // Backend returns { statusCode: 200, message: "Success", data: [...] }
        const holidayList = res.data.data || []
        const map: HolidayMap = {}
        for (const h of holidayList) map[h.date] = h
        holidayCache.set(currentYear, map)
        setHolidays(map)
      } catch (err) {
        console.error('Failed to fetch holidays:', err)
      }
    }
    fetchHolidays()
  }, [currentYear])

  // Group todos by date key
  const todosByDate = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
    if (todo.dueDate) {
      const key = todo.dueDate.slice(0, 10)
      acc[key] = [...(acc[key] ?? []), todo]
    }
    return acc
  }, {})

  const handleDayClick = (date: Date) => {
    setPresetDate(formatDateKey(date))
    setEditingTodo(undefined)
    setFormOpen(true)
  }

  const handleTodoClick = async (todo: Todo, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await todoApi.getOne(todo.id)
      setEditingTodo(res.data)
      setPresetDate(undefined)
      setFormOpen(true)
    } catch {
      toast.error(t('error'))
    }
  }

  const handleSave = async (
    payload: CreateTodoPayload | UpdateTodoPayload,
    files?: File[]
  ) => {
    if (editingTodo) {
      let res = await todoApi.update(
        editingTodo.id,
        payload as UpdateTodoPayload
      )
      if (files?.length)
        res = await todoApi.uploadAttachments(res.data.id, files)
      setTodos(prev =>
        prev.map(td => (td.id === res.data.id ? { ...td, ...res.data } : td))
      )
      toast.success(t('todoUpdated'))
    } else {
      let res = await todoApi.create(payload as CreateTodoPayload)
      if (files?.length)
        res = await todoApi.uploadAttachments(res.data.id, files)
      setTodos(prev => [res.data, ...prev])
      toast.success(t('todoCreated'))
    }
  }

  const handleDelete = async () => {
    if (!deletingTodo) return
    await todoApi.delete(deletingTodo.id)
    setTodos(prev => prev.filter(td => td.id !== deletingTodo.id))
    setDeletingTodo(null)
    toast.success(t('todoDeleted'))
  }

  // Navigation
  const navigate = (direction: -1 | 1) => {
    const d = new Date(current)
    if (view === 'month') d.setMonth(d.getMonth() + direction)
    else if (view === 'week') d.setDate(d.getDate() + direction * 7)
    else d.setDate(d.getDate() + direction)
    setCurrent(d)
  }

  const goToday = () => setCurrent(new Date())

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderTodoDot = (todo: Todo) => {
    const color = todo.priority ? getPriorityColor(todo.priority) : '#6366f1'
    const imageKeys = todo.images?.filter(isImageKey) ?? []
    const fileKeys = todo.images?.filter(k => !isImageKey(k)) ?? []
    return (
      <TooltipProvider key={todo.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="cursor-pointer truncate rounded px-1 py-0.5 text-xs transition-opacity hover:opacity-80"
              style={{
                backgroundColor: `${color}22`,
                color,
                borderLeft: `2px solid ${color}`
              }}
              onClick={e => handleTodoClick(todo, e)}
            >
              {todo.completed && <span className="mr-1 opacity-60">✓</span>}
              {todo.title}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="max-w-[220px]">
            <div className="space-y-2">
              <div>
                <p className="font-medium">{todo.title}</p>
                {todo.dueDate && (
                  <p className="text-xs opacity-75">
                    📅 {format(new Date(todo.dueDate), 'PP h:mm a', { locale })}
                  </p>
                )}
              </div>

              {todo.category && (
                <CategoryBadge
                  category={todo.category}
                  className="origin-left scale-90"
                />
              )}

              {imageKeys.length > 0 && (
                <div className="flex -space-x-3 rounded-lg">
                  {imageKeys.slice(0, 3).map((img, i) => (
                    <img
                      key={img}
                      src={getThumbnailUrl(img)}
                      alt={`Attachment ${i + 1}`}
                      className="border-border bg-muted h-8 w-8 cursor-pointer rounded border object-cover"
                      style={{ zIndex: 10 - i }}
                    />
                  ))}
                  {imageKeys.length > 3 && (
                    <div className="border-border bg-muted text-muted-foreground z-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded border text-xs font-medium">
                      +{imageKeys.length - 3}
                    </div>
                  )}
                </div>
              )}

              {fileKeys.length > 0 && (
                <div className="text-foreground flex w-full flex-wrap gap-1.5">
                  {fileKeys.map(key => {
                    const Icon = getFileIcon(key)
                    const filename = getFilename(key)
                    return (
                      <div
                        key={key}
                        className="border-border bg-muted flex max-w-[calc(220px-24px)] items-center gap-1.5 rounded border px-2 py-1 text-xs"
                      >
                        <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{filename}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // ── Month View ────────────────────────────────────────────────────────────

  const renderMonthView = () => {
    const year = current.getFullYear()
    const month = current.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const today = new Date()
    const cells: (Date | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => new Date(year, month, i + 1)
      )
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    return (
      <div className="flex-1 overflow-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(2024, 0, i + 7) // Starts from Sunday (Jan 7, 2024 was a Sunday)
            return (
              <div
                key={format(d, 'eeee')}
                className="text-muted-foreground py-2 text-center text-xs font-medium"
              >
                {format(d, 'eee', { locale })}
              </div>
            )
          })}
        </div>

        {/* Calendar grid */}
        <div
          className="grid grid-cols-7"
          style={{ gridAutoRows: 'minmax(60px, 1fr)' }}
        >
          {cells.map((date, idx) => {
            const key = date ? formatDateKey(date) : `empty-${idx}`
            const dayTodos = date
              ? (todosByDate[formatDateKey(date)] ?? [])
              : []
            const isToday = date ? isSameDay(date, today) : false
            const isCurrentMonth = !!date
            const currentHoliday = date
              ? holidays[formatDateKey(date)]
              : undefined
            const holidayLabel = currentHoliday
              ? isVi
                ? currentHoliday.localName
                : currentHoliday.name
              : undefined

            return (
              <div
                key={key}
                className={`min-h-[100px] border-r border-b px-1 py-1 transition-colors ${
                  isCurrentMonth
                    ? 'hover:bg-accent/30 cursor-pointer'
                    : 'bg-muted/20'
                }`}
                onClick={() => date && handleDayClick(date)}
              >
                {date && (
                  <div
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                )}
                {holidayLabel && currentHoliday && (
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <div className="mb-0.5 w-fit truncate px-0.5 text-[10px] leading-tight font-medium text-red-500">
                          🇻🇳 {holidayLabel}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>
                        <p className="text-xs font-semibold">
                          {isVi
                            ? currentHoliday.localName
                            : currentHoliday.name}
                        </p>
                        {currentHoliday.name !== currentHoliday.localName && (
                          <p className="text-muted-foreground text-[10px]">
                            {isVi
                              ? currentHoliday.name
                              : currentHoliday.localName}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="space-y-0.5">
                  {dayTodos.slice(0, 3).map(todo => renderTodoDot(todo))}
                  {dayTodos.length > 3 && (
                    <div
                      className="text-primary hover:bg-primary/10 cursor-pointer rounded pl-1 text-xs font-medium transition-colors"
                      onClick={e => {
                        e.stopPropagation()
                        const rect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect()
                        setDayPopover({
                          date: formatDateKey(date!),
                          todos: dayTodos,
                          anchor: {
                            top: rect.bottom + window.scrollY,
                            left: rect.left + window.scrollX
                          }
                        })
                      }}
                    >
                      +{dayTodos.length - 3} {t('more')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Week View ─────────────────────────────────────────────────────────────

  const renderWeekView = () => {
    const today = new Date()
    const weekDays = getWeekDays(current)

    return (
      <div className="flex-1 overflow-auto">
        {/* Day headers */}
        <div className="bg-background sticky top-0 z-10 grid grid-cols-8 border-b">
          <div className="border-r py-2" /> {/* time gutter */}
          {weekDays.map(day => (
            <div
              key={day.toISOString()}
              className={`hover:bg-accent/30 cursor-pointer py-2 text-center transition-colors ${
                isSameDay(day, today)
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground'
              }`}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-xs">{format(day, 'eee', { locale })}</div>
              <div
                className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  isSameDay(day, today)
                    ? 'bg-primary text-primary-foreground'
                    : ''
                }`}
              >
                {day.getDate()}
              </div>
              {/* dot for todos */}
              {(todosByDate[formatDateKey(day)] ?? []).length > 0 && (
                <div className="bg-primary mx-auto mt-0.5 h-1 w-1 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="grid grid-cols-8">
          {HOURS.map(hour => (
            <Fragment key={hour}>
              <div className="text-muted-foreground border-r border-b py-2 pr-2 text-right text-[10px] uppercase">
                {format(new Date().setHours(hour, 0), 'h a', { locale })}
              </div>
              {weekDays.map(day => {
                const dayTodos = todosByDate[formatDateKey(day)] ?? []
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="hover:bg-accent/20 min-h-[48px] cursor-pointer border-r border-b p-0.5 transition-colors"
                    onClick={() => handleDayClick(day)}
                  >
                    {dayTodos
                      .filter(todo => {
                        if (!todo.dueDate?.includes('T')) return hour === 8 // Fallback for old dates
                        const todoHour = parseInt(todo.dueDate.slice(11, 13))
                        return todoHour === hour
                      })
                      .map(todo => renderTodoDot(todo))}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  // ── Day View ──────────────────────────────────────────────────────────────

  const renderDayView = () => {
    const dayKey = formatDateKey(current)
    const dayTodos = todosByDate[dayKey] ?? []
    const today = new Date()
    const isToday = isSameDay(current, today)

    return (
      <div className="flex-1 overflow-auto">
        <div className="border-b p-4 text-center">
          <div
            className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}
          >
            {format(current, 'cccc, MMMM dd, yyyy', { locale })}
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr]">
          {HOURS.map(hour => (
            <Fragment key={hour}>
              <div className="text-muted-foreground border-r border-b py-3 pr-3 text-right text-[11px] whitespace-nowrap uppercase">
                {format(new Date().setHours(hour, 0), 'h a', { locale })}
              </div>
              <div
                className="hover:bg-accent/20 min-h-[56px] cursor-pointer border-b p-1 transition-colors"
                onClick={() => handleDayClick(current)}
              >
                {dayTodos
                  .filter(todo => {
                    if (!todo.dueDate?.includes('T')) return hour === 8
                    const todoHour = parseInt(todo.dueDate.slice(11, 13))
                    return todoHour === hour
                  })
                  .map(todo => renderTodoDot(todo))}
              </div>
            </Fragment>
          ))}
        </div>

        {/* All todos for the day */}
        {dayTodos.length === 0 && (
          <div
            className="text-muted-foreground flex cursor-pointer flex-col items-center justify-center gap-2 py-16"
            onClick={() => handleDayClick(current)}
          >
            <span className="text-4xl opacity-30">📅</span>
          </div>
        )}
      </div>
    )
  }

  // ── Title ─────────────────────────────────────────────────────────────────

  const getTitle = () => {
    if (view === 'month') return format(current, 'MMMM yyyy', { locale })
    if (view === 'week') {
      const start = startOfWeek(current, { weekStartsOn: 1 })
      const end = endOfWeek(current, { weekStartsOn: 1 })
      if (start.getMonth() === end.getMonth()) {
        return (
          format(start, 'MMM dd', { locale }) +
          ' - ' +
          format(end, 'dd, yyyy', { locale })
        )
      }
      return (
        format(start, 'MMM dd', { locale }) +
        ' - ' +
        format(end, 'MMM dd, yyyy', { locale })
      )
    }
    return format(current, 'MMMM dd, yyyy', { locale })
  }

  return (
    <div className="flex h-full flex-col space-y-4 overflow-hidden">
      {/* ── Navigation Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Desktop Header */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:items-center">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className="text-xs"
            >
              {t('today')}
            </Button>
            <div className="ml-1 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <DatePicker
              value={formatDateKey(current)}
              onChange={dateStr => {
                if (dateStr) setCurrent(new Date(dateStr))
              }}
              className="hover:bg-accent/50 h-auto border-none bg-transparent p-0"
            >
              <h2 className="hover:text-primary cursor-pointer text-lg font-bold tracking-tight transition-colors">
                {getTitle()}
              </h2>
            </DatePicker>
          </div>

          <div className="flex justify-end">
            <div className="flex w-fit overflow-hidden rounded-md border">
              {(['month', 'week', 'day'] as CalendarView[]).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    view === v
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {t(`calendar${v.charAt(0).toUpperCase() + v.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToday}>
                {t('today')}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex overflow-hidden rounded-md border">
              {(['month', 'week', 'day'] as CalendarView[]).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-2.5 py-1 text-xs font-medium ${view === v ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {t(
                    `calendar${v.charAt(0).toUpperCase() + v.slice(1)}`
                  ).charAt(0)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <DatePicker
              value={formatDateKey(current)}
              onChange={dateStr => {
                if (dateStr) setCurrent(new Date(dateStr))
              }}
              className="h-auto border-none bg-transparent p-0"
            >
              <h2 className="cursor-pointer text-center text-xl font-bold">
                {getTitle()}
              </h2>
            </DatePicker>
          </div>
        </div>
      </div>

      {/* Calendar body */}
      <div className="bg-card min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Dialogs */}
      <TodoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editingTodo}
        categories={categories}
        initialDate={presetDate}
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
      {/* Day Todos Popover — shown when clicking "+N more" */}
      {dayPopover && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDayPopover(null)}
          />
          {/* Popover card */}
          <div
            ref={popoverRef}
            className="bg-card border-border fixed z-50 max-w-[300px] min-w-[220px] rounded-lg border p-3 shadow-xl"
            style={{
              top: dayPopover.anchor.top + 4,
              left: Math.min(dayPopover.anchor.left, window.innerWidth - 320)
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {format(new Date(dayPopover.date), 'PPPP', { locale })}
              </span>
              <button
                type="button"
                onClick={() => setDayPopover(null)}
                className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {dayPopover.todos.map(todo => renderTodoDot(todo))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
