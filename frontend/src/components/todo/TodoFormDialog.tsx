import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FileDropzone } from '@/components/common/FileDropzone'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TimePicker } from '@/components/ui/time-picker'
import { getPriorityColor } from '@/constants/todo.constants'
import { isImageKey } from '@/lib/attachment.utils'
import { getThumbnailUrl } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { todoSchema } from '@/schemas/todo/todo.schema.ts'
import type { TodoFormValues } from '@/schemas/todo/todo.schema.ts'
import type {
  Category,
  CreateTodoPayload,
  Todo,
  UpdateTodoPayload
} from '@/types'

interface TodoFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (
    payload: CreateTodoPayload | UpdateTodoPayload,
    files?: File[]
  ) => Promise<void>
  initial?: Todo
  categories?: Category[]
  initialDate?: string // pre-set from calendar click
}

export default function TodoFormDialog({
  open,
  onClose,
  onSave,
  initial,
  categories = [],
  initialDate
}: TodoFormDialogProps) {
  const { t } = useTranslation('common')

  const form = useForm<TodoFormValues>({
    mode: 'onChange',
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 5,
      dueDate: '',
      dueTime: '09:00',
      categoryId: null
    }
  })

  const [saving, setSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      const defaultDate = initialDate ?? ''
      const fullDate = initial?.dueDate ?? ''

      form.reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        priority: initial?.priority ?? 5,
        dueDate: fullDate ? fullDate.slice(0, 10) : defaultDate,
        dueTime:
          fullDate && fullDate.includes('T') ? fullDate.slice(11, 16) : '09:00',
        categoryId: initial?.categoryId ?? null
      })
      setSelectedFiles([])
      setExistingImages(initial?.images || [])
    }
  }, [initial, open, initialDate, form])

  const onSubmit = async (values: TodoFormValues) => {
    setSaving(true)
    try {
      // Combine date and time into ISO string
      const isoDueDate = `${values.dueDate}T${values.dueTime}:00Z`

      const payload: CreateTodoPayload | UpdateTodoPayload = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        priority: values.priority,
        dueDate: isoDueDate,
        categoryId: values.categoryId || null
      }
      if (initial) (payload as UpdateTodoPayload).images = existingImages
      await onSave(
        payload,
        selectedFiles.length > 0 ? selectedFiles : undefined
      )
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{initial ? t('editTodo') : t('addTodo')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="todo-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4 overflow-y-auto p-1"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('todoTitle')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('titlePlaceholder')}
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        field.value.length >= 100
                          ? 'font-bold text-orange-500'
                          : field.value.length > 80
                            ? 'text-orange-400'
                            : 'text-muted-foreground'
                      )}
                    >
                      {field.value.length}/100
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('todoDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('descriptionPlaceholder')}
                      rows={3}
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        field.value.length >= 1000
                          ? 'font-bold text-orange-500'
                          : field.value.length > 900
                            ? 'text-orange-400'
                            : 'text-muted-foreground'
                      )}
                    >
                      {field.value.length}/1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Priority flags */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('priority')}</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-10 gap-1.5">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(p => {
                        const selected = field.value === p
                        const col = getPriorityColor(p)
                        return (
                          <button
                            key={p}
                            id={p === 1 ? field.name : undefined}
                            type="button"
                            onClick={() => field.onChange(p)}
                            className={`flex flex-col items-center gap-0.5 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all hover:scale-110 ${
                              selected
                                ? 'scale-110 shadow-md'
                                : 'border-border opacity-60 hover:opacity-100'
                            }`}
                            style={{
                              color: selected ? col : 'currentColor',
                              borderColor: selected ? col : undefined,
                              backgroundColor: selected ? `${col}15` : undefined
                            }}
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                              <rect
                                x="5"
                                y="2"
                                width="2"
                                height="20"
                                rx="1"
                                fill="currentColor"
                              />
                              <path
                                d="M7 2.5L17.5 7L7 11.5Z"
                                fill={selected ? col : 'currentColor'}
                                opacity={selected ? 1 : 0.7}
                              />
                            </svg>
                            {p}
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('category')}</FormLabel>
                    <Select
                      onValueChange={val =>
                        field.onChange(val === 'none' ? null : val)
                      }
                      value={field.value ?? 'none'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('noCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t('noCategory')}</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-1.5">
                              {cat.icon && (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                  {isImageKey(cat.icon) ? (
                                    <img
                                      src={getThumbnailUrl(cat.icon)}
                                      alt=""
                                      className="h-full w-full rounded-sm object-cover"
                                    />
                                  ) : (
                                    <span>{cat.icon}</span>
                                  )}
                                </span>
                              )}
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due date and Time */}
              <div className="space-y-2 sm:col-span-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex-2">
                        <FormLabel>{t('dueDate')}</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('selectDate')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('dueTime')}</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-0">
              <FormLabel className="text-sm font-medium">
                {t('images')}
              </FormLabel>
              <FileDropzone
                value={selectedFiles}
                onChange={setSelectedFiles}
                existingImages={existingImages}
                onRemoveExisting={key =>
                  setExistingImages(prev => prev.filter(img => img !== key))
                }
                onRemoveAllExisting={() => setExistingImages([])}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="border-border -mx-4 -mb-4 rounded-b-xl border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            form="todo-form"
            disabled={saving || !form.formState.isValid}
          >
            {saving ? <Loader size="sm" /> : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
