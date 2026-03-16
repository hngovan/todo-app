import { zodResolver } from '@hookform/resolvers/zod'
import { CircleFadingPlus, ImageIcon, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { storageApi } from '@/apis/storageApi'
import { Button } from '@/components/ui/button'
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
import { isImageKey } from '@/lib/attachment.utils'
import { getThumbnailUrl } from '@/lib/storage'
import { cn } from '@/lib/utils'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '@/types'

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
  '#0f172a',
  '#ffffff'
]

const PRESET_EMOJIS = [
  '💼',
  '🏠',
  '🛒',
  '📚',
  '🏋️',
  '✈️',
  '🍔',
  '🎉',
  '💡',
  '🔔',
  '💻',
  '💸',
  '❤️',
  '🎓',
  '🏥',
  '🚗'
]

const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name must be 100 characters or less'),
  icon: z.string().optional(),
  color: z.string().min(1, 'Color is required')
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (
    payload: CreateCategoryPayload | UpdateCategoryPayload
  ) => Promise<void>
  initial?: Category
}

export default function CategoryFormDialog({
  open,
  onClose,
  onSave,
  initial
}: CategoryFormDialogProps) {
  const { t } = useTranslation('common')

  const form = useForm<CategoryFormValues>({
    mode: 'onChange',
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '#6366f1'
    }
  })

  const [iconFile, setIconFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? '',
        icon: initial?.icon ?? '',
        color: initial?.color ?? '#6366f1'
      })
      setIconFile(null)
    }
  }, [initial, open, form])

  const onSubmit = async (values: CategoryFormValues) => {
    setSaving(true)
    try {
      let finalIcon = values.icon?.trim() || undefined
      if (iconFile) {
        const res = await storageApi.uploadFile('categories', iconFile)
        finalIcon = res.data.key
      }

      await onSave({
        name: values.name.trim(),
        icon: finalIcon,
        color: values.color
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleColorBubbleClick = () => {
    // Trigger native color picker
    colorInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {initial ? t('editCategory') : t('addCategory')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryName')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('categoryNamePlaceholder')}
                      maxLength={100}
                      autoComplete="off"
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryIcon')}</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {/* Unified Avatar-style Picker/Preview */}
                        <div className="group relative">
                          <button
                            id={field.name}
                            type="button"
                            onClick={() => iconInputRef.current?.click()}
                            className={cn(
                              'hover:bg-accent/50 relative flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed transition-all',
                              field.value || iconFile
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 bg-muted/30'
                            )}
                          >
                            {iconFile ? (
                              <img
                                src={URL.createObjectURL(iconFile)}
                                alt="Preview"
                                className="h-full w-full rounded-[10px] object-cover"
                              />
                            ) : field.value ? (
                              isImageKey(field.value) ? (
                                <img
                                  src={getThumbnailUrl(field.value)}
                                  alt="Icon"
                                  className="h-full w-full rounded-[10px] object-cover"
                                />
                              ) : (
                                <span className="text-2xl">{field.value}</span>
                              )
                            ) : (
                              <div className="text-muted-foreground flex flex-col items-center gap-0.5">
                                <ImageIcon className="h-5 w-5 opacity-40" />
                                <span className="text-[8px] font-bold tracking-wider uppercase opacity-60">
                                  Icon
                                </span>
                              </div>
                            )}

                            {/* Hover Overlay for Upload */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                          </button>

                          {/* Overlay X (Clear) Button */}
                          {(field.value || iconFile) && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                field.onChange('')
                                setIconFile(null)
                              }}
                              className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110 active:scale-95"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={iconInputRef}
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) {
                              setIconFile(f)
                              field.onChange('')
                            }
                            e.target.value = ''
                          }}
                        />
                      </div>

                      {/* Emoji Grid */}
                      <div className="flex flex-wrap gap-1 rounded-md border p-2">
                        {PRESET_EMOJIS.map(emoji => {
                          const selected = field.value === emoji && !iconFile
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                field.onChange(emoji)
                                setIconFile(null)
                              }}
                              className={`hover:bg-accent flex h-8 w-8 items-center justify-center rounded text-base transition-colors ${
                                selected
                                  ? 'bg-primary/20 ring-primary ring-1'
                                  : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryColor')}</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Preset swatches */}
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          title={c}
                          onClick={() => field.onChange(c)}
                          className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                            field.value === c
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}

                      {/* Custom color trigger */}
                      <button
                        type="button"
                        title={t('customColor')}
                        onClick={handleColorBubbleClick}
                        className="text-muted-foreground hover:text-foreground relative flex h-7 w-7 items-center justify-center transition-all hover:scale-110"
                      >
                        <CircleFadingPlus className="h-full w-full" />
                        {/* Hidden native color input */}
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label={t('customColor')}
                        />
                      </button>

                      {/* Current color preview + hex */}
                      <div className="ml-2 flex items-center gap-2">
                        <div
                          className="border-border h-6 w-6 rounded border"
                          style={{ backgroundColor: field.value }}
                        />
                        <span className="text-muted-foreground font-mono text-sm">
                          {field.value}
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.formState.isValid}
              >
                {saving ? <Loader size="sm" /> : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
