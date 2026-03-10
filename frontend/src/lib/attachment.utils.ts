/**
 * Attachment utilities — detect file type by extension/MIME, provide icons & labels.
 * Used by FileDropzone, TodoItem, and anywhere attachments are displayed.
 */
import { FileText, FileSpreadsheet, File, ImageIcon } from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

/** File types we treat as images (open in PhotoGallery) */
const IMAGE_EXTS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
  '.bmp'
])

/** Extract file extension (lowercase) from an object key or filename */
export function getExt(key: string): string {
  const dot = key.lastIndexOf('.')
  return dot !== -1 ? key.slice(dot).toLowerCase() : ''
}

/** True if the key/filename is an image that can be previewed in the gallery */
export function isImageKey(key: string): boolean {
  // Exclude thumbnail keys (they are derived, not original attachments)
  if (key.includes('-thumb.')) return false
  return IMAGE_EXTS.has(getExt(key))
}

/** File type category for display purposes */
export type FileType =
  | 'image'
  | 'pdf'
  | 'spreadsheet'
  | 'document'
  | 'text'
  | 'other'

export function getFileType(key: string): FileType {
  if (isImageKey(key)) return 'image'
  const ext = getExt(key)
  if (ext === '.pdf') return 'pdf'
  if (['.csv', '.xls', '.xlsx'].includes(ext)) return 'spreadsheet'
  if (['.doc', '.docx'].includes(ext)) return 'document'
  if (['.txt', '.md'].includes(ext)) return 'text'
  return 'other'
}

/** Lucide icon component for this file type */
export function getFileIcon(key: string): LucideIcon {
  const type = getFileType(key)
  switch (type) {
    case 'image':
      return ImageIcon
    case 'pdf':
      return FileText
    case 'spreadsheet':
      return FileSpreadsheet
    case 'document':
      return FileText
    default:
      return File
  }
}

/** Short human-readable label e.g. "PDF", "CSV", "Image" */
export function getFileLabel(key: string): string {
  const ext = getExt(key)
  if (!ext) return 'File'
  return ext.slice(1).toUpperCase() // ".pdf" → "PDF"
}

/** Extract a display-friendly filename from a MinIO object key
 *  e.g. "todos/abc-def.pdf" → "abc-def.pdf"
 */
export function getFilename(key: string): string {
  return key.split('/').pop() ?? key
}

/** Accept attribute for <input type="file"> */
export const ACCEPTED_FILE_TYPES =
  'image/*,application/pdf,text/csv,text/plain,' +
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/**
 * Exact MIME types allowed by the backend — used for CLIENT-SIDE validation.
 * Must stay in sync with backend ALLOWED_MIME_TYPES in todo.constants.ts.
 */
export const ALLOWED_MIME_TYPES = new Set([
  // Images (all common formats)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Documents
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
])

/**
 * Filter a list of Files to only those with allowed MIME types.
 * Returns { allowed, rejected } so caller can show errors for rejected files.
 */
export function filterAllowedFiles(files: File[]): {
  allowed: File[]
  rejected: File[]
} {
  const allowed: File[] = []
  const rejected: File[] = []
  for (const file of files) {
    if (ALLOWED_MIME_TYPES.has(file.type)) {
      allowed.push(file)
    } else {
      rejected.push(file)
    }
  }
  return { allowed, rejected }
}

export const MAX_ATTACHMENTS = 5
