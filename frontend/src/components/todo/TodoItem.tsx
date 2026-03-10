import { enUS, ja, vi } from 'date-fns/locale'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { storageApi } from '@/apis/storageApi'
import PhotoGallery from '@/components/common/PhotoGallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { getFileIcon, getFilename, isImageKey } from '@/lib/attachment.utils'
import { formatDueDate, isOverdueDate } from '@/lib/date'
import { getImageUrl, getThumbnailUrl } from '@/lib/storage'
import type { Todo } from '@/types'

import type { Locale } from 'date-fns'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

const DATE_FNS_LOCALES: Record<string, Locale> = { vi, ja, en: enUS }

export default function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete
}: TodoItemProps) {
  const { t, i18n } = useTranslation('common')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const langCode = i18n.language?.split('-')[0] ?? 'en'
  const dateFnsLocale = DATE_FNS_LOCALES[langCode] ?? enUS
  const overdue = !todo.completed && isOverdueDate(todo.dueDate)

  const allAttachments = todo.images ?? []
  const imageKeys = allAttachments.filter(isImageKey)
  const fileKeys = allAttachments.filter(k => !isImageKey(k))

  const handleDownload = async (
    e: React.MouseEvent,
    key: string,
    filename: string
  ) => {
    e.preventDefault()
    try {
      const blob = await storageApi.downloadFile(key)
      const blobUrl = window.URL.createObjectURL(blob)

      // Create a temporary hidden anchor to trigger download
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download error:', err)
      toast.error(t('error'))
    }
  }

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className="bg-card hover:bg-accent/40 flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-colors">
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo)}
        aria-label={todo.completed ? t('markIncomplete') : t('markComplete')}
        className="mt-0.5"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label
          htmlFor={`todo-${todo.id}`}
          className={`cursor-pointer leading-snug font-medium break-all ${
            todo.completed
              ? 'text-muted-foreground line-through'
              : 'text-foreground'
          }`}
        >
          {todo.title}
        </label>

        {todo.description && (
          <p className="text-muted-foreground line-clamp-3 text-sm break-all">
            {todo.description}
          </p>
        )}

        {/* ── Image thumbnails (stacked) ────────────────────────────────── */}
        {imageKeys.length > 0 && (
          <div className="flex -space-x-3">
            {imageKeys.slice(0, 3).map((img, i) => (
              <img
                key={img}
                src={getThumbnailUrl(img)}
                alt={`Attachment ${i + 1}`}
                className="border-border h-10 w-10 cursor-pointer rounded-lg border object-cover transition-transform hover:-translate-y-1 sm:h-12 sm:w-12"
                style={{ zIndex: 10 - i }}
                onClick={() => openGallery(i)}
                onError={e => {
                  e.currentTarget.src = getImageUrl(img)
                }}
                loading="lazy"
                decoding="async"
                width={32}
                height={32}
              />
            ))}
            {imageKeys.length > 3 && (
              <div
                className="border-border bg-muted text-muted-foreground z-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-2 text-xs font-medium sm:h-12 sm:w-12 sm:text-sm"
                onClick={() => openGallery(3)}
              >
                +{imageKeys.length - 3}
              </div>
            )}
          </div>
        )}

        {/* ── File chips (PDF, CSV, etc.) ───────────────────────────────── */}
        {fileKeys.length > 0 && (
          <TooltipProvider>
            <div className="flex flex-wrap gap-1.5">
              {fileKeys.map(key => {
                const Icon = getFileIcon(key)
                const filename = getFilename(key)
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <a
                        href="#"
                        onClick={e => handleDownload(e, key, filename)}
                        className="border-border bg-muted hover:bg-accent flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                      >
                        <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                        <span className="max-w-[120px] truncate">
                          {filename}
                        </span>
                        <Download className="text-muted-foreground h-3 w-3 shrink-0" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[300px] break-all">{filename}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
        )}

        {todo.dueDate && (
          <p
            className={`mt-1 text-xs ${
              overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
            }`}
          >
            {overdue ? `⚠ ${t('overdue')}` : `📅 ${t('dueDate')}`}:{' '}
            {formatDueDate(todo.dueDate, dateFnsLocale, 'PP')}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {todo.priority && (
          <Badge
            variant="outline"
            className={`hidden sm:inline-flex ${
              todo.priority === 'high'
                ? 'border-destructive text-destructive'
                : todo.priority === 'medium'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-emerald-500 text-emerald-500'
            }`}
          >
            {t(`priority_${todo.priority}`, { defaultValue: todo.priority })}
          </Badge>
        )}

        {todo.completed && (
          <Badge className="hidden bg-green-600 text-white hover:bg-green-700 sm:inline-flex">
            {t('completed')}
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(todo)}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(todo)}
              className="text-destructive focus:text-destructive"
            >
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* PhotoGallery — only for image attachments */}
      <PhotoGallery
        images={imageKeys}
        open={galleryOpen}
        currentIndex={galleryIndex}
        onClose={() => setGalleryOpen(false)}
        onIndexChange={setGalleryIndex}
      />
    </div>
  )
}
