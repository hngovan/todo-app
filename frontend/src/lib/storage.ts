/**
 * Builds the full public URL for a given MinIO object key.
 *
 * E.g., given "todos/xyz.jpg"
 * Returns "http://localhost:9000/todo-app/todos/xyz.jpg"
 */
export function getImageUrl(objectKey: string): string {
  if (!objectKey) return ''
  // If it's already a full URL or a blob URL (for local preview), return as is
  if (
    objectKey.startsWith('blob:') ||
    objectKey.startsWith('http://') ||
    objectKey.startsWith('https://')
  ) {
    return objectKey
  }

  const minioUrl = import.meta.env.VITE_MINIO_URL || 'http://localhost:9000'
  const bucketName = import.meta.env.VITE_MINIO_BUCKET || 'todo-app'

  // Ensure no double slashes, handle trailing slashes in VITE_MINIO_URL
  const baseUrl = minioUrl.replace(/\/$/, '')
  return `${baseUrl}/${bucketName}/${objectKey}`
}

/**
 * Builds the full public URL for the generated '-thumb.webp' thumbnail of a given MinIO object key.
 */
export function getThumbnailUrl(objectKey: string): string {
  if (!objectKey) return ''
  // If it's a blob from a newly selected file, just return the blob directly
  if (objectKey.startsWith('blob:')) return objectKey

  // Strip the original extension and append '-thumb.webp'
  // e.g., "todos/xyz.jpg" -> "todos/xyz-thumb.webp"
  const lastDotIdx = objectKey.lastIndexOf('.')
  let thumbKey = objectKey
  if (lastDotIdx !== -1) {
    thumbKey = objectKey.substring(0, lastDotIdx) + '-thumb.webp'
  }

  return getImageUrl(thumbKey)
}
