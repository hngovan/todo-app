import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  CreateTodoPayload,
  Todo,
  TodoFormValues,
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
}

export default function TodoFormDialog({
  open,
  onClose,
  onSave,
  initial
}: TodoFormDialogProps) {
  const { t } = useTranslation('common')

  const [form, setForm] = useState<TodoFormValues>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })
  const [saving, setSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    setForm({
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      priority: initial?.priority ?? 'medium',
      dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : ''
    })
    setSelectedFiles([])
    setExistingImages(initial?.images || [])
  }, [initial, open])

  const handleChange =
    (field: keyof TodoFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

  const handleSelectChange = (field: keyof TodoFormValues) => (val: string) => {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.dueDate) return
    setSaving(true)
    try {
      const payload: CreateTodoPayload | UpdateTodoPayload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: form.dueDate
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
        className="flex max-h-[90vh] flex-col sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{initial ? t('editTodo') : t('addTodo')}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-1"
        >
          <div className="space-y-2">
            <Label htmlFor="todo-title">{t('todoTitle')}</Label>
            <Input
              id="todo-title"
              placeholder={t('titlePlaceholder')}
              value={form.title}
              onChange={handleChange('title')}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todo-description">{t('todoDescription')}</Label>
            <Textarea
              id="todo-description"
              placeholder={t('descriptionPlaceholder')}
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="todo-priority">{t('priority')}</Label>
              <Select
                value={form.priority}
                onValueChange={handleSelectChange('priority')}
              >
                <SelectTrigger id="todo-priority" className="w-full">
                  <SelectValue placeholder={t('priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('priorityLow')}</SelectItem>
                  <SelectItem value="medium">{t('priorityMedium')}</SelectItem>
                  <SelectItem value="high">{t('priorityHigh')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="todo-due">{t('todoDueDate')}</Label>
              <DatePicker
                value={form.dueDate}
                onChange={date => setForm(prev => ({ ...prev, dueDate: date }))}
                placeholder={t('selectDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('images')}</Label>
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

          <div className="bg-background sticky bottom-0 pt-2">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.title.trim() || !form.dueDate}
              >
                {saving ? <Loader size="sm" /> : t('save')}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
