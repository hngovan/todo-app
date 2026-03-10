/**
 * FileDropzone — drag-and-drop file uploader supporting images, PDF, CSV, Word, Excel.
 *
 * Features:
 *  - Upload zone (click or drag-and-drop)
 *  - Max 5 attachments total (existing + new)
 *  - Thumbnail for images, file-type icon for non-images
 *  - Per-file remove button (×)
 *  - "Remove all" button when ≥1 attachment exists
 */
import { UploadCloud, Trash2, X } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import {
  ACCEPTED_FILE_TYPES,
  filterAllowedFiles,
  getExt,
  getFilename,
  getFileIcon,
  isImageKey,
  MAX_ATTACHMENTS
} from '@/lib/attachment.utils'
import { getImageUrl } from '@/lib/storage'

interface FileDropzoneProps {
  value: File[]
  onChange: (files: File[]) => void
  existingImages?: string[]
  onRemoveExisting?: (key: string) => void
  onRemoveAllExisting?: () => void
  isLoading?: boolean
}

export function FileDropzone({
  value,
  onChange,
  existingImages = [],
  onRemoveExisting,
  onRemoveAllExisting,
  isLoading = false
}: FileDropzoneProps) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = existingImages.length + value.length
  const limitReached = totalCount >= MAX_ATTACHMENTS

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (limitReached) return
      const dropped = Array.from(e.dataTransfer.files)
      const { allowed: typed, rejected } = filterAllowedFiles(dropped)
      if (rejected.length > 0) {
        toast.error(
          `File type not allowed: ${rejected.map(f => f.name).join(', ')}`
        )
      }
      const remaining = MAX_ATTACHMENTS - totalCount
      if (typed.length > remaining) {
        toast.error(t('attachmentLimitReached', { max: MAX_ATTACHMENTS }))
      }
      const allowed = typed.slice(0, remaining)
      if (allowed.length > 0) onChange([...value, ...allowed])
    },
    [value, onChange, limitReached, totalCount, t]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    const { allowed: typed, rejected } = filterAllowedFiles(selected)
    if (rejected.length > 0) {
      toast.error(
        `File type not allowed: ${rejected.map(f => f.name).join(', ')}`
      )
    }
    const remaining = MAX_ATTACHMENTS - totalCount
    if (typed.length > remaining) {
      toast.error(t('attachmentLimitReached', { max: MAX_ATTACHMENTS }))
    }
    const allowed = typed.slice(0, remaining)
    if (allowed.length > 0) onChange([...value, ...allowed])
    e.target.value = ''
  }

  const removeNewFile = (index: number) => {
    const next = [...value]
    next.splice(index, 1)
    onChange(next)
  }

  const handleRemoveAll = () => {
    onChange([])
    onRemoveAllExisting?.()
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        className={`bg-muted/50 relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 transition-colors ${
          limitReached
            ? 'border-muted-foreground/15 cursor-not-allowed opacity-60'
            : 'border-muted-foreground/25 hover:bg-muted hover:border-muted-foreground/40'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !limitReached && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={handleFileInput}
          disabled={limitReached}
        />
        <UploadCloud className="text-muted-foreground mb-2 h-7 w-7" />
        <p className="text-foreground text-center text-sm font-medium">
          {limitReached
            ? t('attachmentLimitReached', { max: MAX_ATTACHMENTS })
            : t('uploadImagesClick')}
        </p>
        <p className="text-muted-foreground mt-0.5 text-center text-xs">
          {t('attachmentTypes')} · {totalCount}/{MAX_ATTACHMENTS}
        </p>
        {isLoading && <Loader size="sm" className="mt-2" />}
      </div>

      {/* Attachment list */}
      {totalCount > 0 && (
        <div className="space-y-2">
          {/* Header row with Remove All button */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {totalCount} {t('attachmentCount', { count: totalCount })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-6 gap-1 px-2 text-xs"
              onClick={handleRemoveAll}
            >
              <Trash2 className="h-3 w-3" />
              {t('removeAll')}
            </Button>
          </div>

          <div className="max-h-[220px] space-y-2 overflow-x-hidden overflow-y-auto pr-1">
            {/* Existing MinIO attachments */}
            {existingImages.map(key => (
              <AttachmentRow
                key={key}
                name={getFilename(key)}
                isImage={isImageKey(key)}
                previewSrc={isImageKey(key) ? getImageUrl(key) : undefined}
                fileKey={key}
                onRemove={() => onRemoveExisting?.(key)}
              />
            ))}

            {/* Newly selected files (not yet uploaded) */}
            {value.map((file, idx) => (
              <AttachmentRow
                // eslint-disable-next-line react-x/no-array-index-key
                key={`${file.name}-${idx}`}
                name={file.name}
                isImage={file.type.startsWith('image/')}
                previewSrc={
                  file.type.startsWith('image/')
                    ? URL.createObjectURL(file)
                    : undefined
                }
                onRemove={() => removeNewFile(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Internal row component ─────────────────────────────────────────────────────

interface AttachmentRowProps {
  name: string
  isImage: boolean
  previewSrc?: string
  fileKey?: string
  onRemove: () => void
}

function AttachmentRow({
  name,
  isImage,
  previewSrc,
  onRemove
}: AttachmentRowProps) {
  const ext = getExt(name)
  // Use a local variable to get the icon; render it via a render function to avoid
  // 'component created during render' lint error
  const iconComponent = isImage ? null : getFileIcon(name)

  const renderIcon = () => {
    if (!iconComponent) return null
    const IconComp = iconComponent
    return <IconComp className="text-muted-foreground h-5 w-5" />
  }

  return (
    <div className="bg-muted/60 flex items-center gap-3 rounded-md border px-3 py-2">
      {/* Thumbnail or file icon */}
      {isImage && previewSrc ? (
        <img
          src={previewSrc}
          alt={name}
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="bg-background flex h-9 w-9 shrink-0 items-center justify-center rounded border">
          {renderIcon()}
        </div>
      )}

      {/* File name + type label */}
      <div className="min-w-0 flex-1">
        <p
          className="text-foreground line-clamp-2 text-sm font-medium break-all"
          title={name}
        >
          {name}
        </p>
        <p className="text-muted-foreground text-xs uppercase">
          {ext.slice(1) || 'file'}
        </p>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
        onClick={onRemove}
        aria-label="Remove file"
        title="Remove file"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
