/**
 * PhotoGallery — fullscreen image gallery powered by react-photo-view's PhotoSlider.
 *
 * Usage:
 *   <PhotoGallery
 *     images={todo.images}      // array of MinIO object keys
 *     open={galleryOpen}
 *     currentIndex={galleryIndex}
 *     onClose={() => setGalleryOpen(false)}
 *     onIndexChange={setGalleryIndex}
 *   />
 *
 * Features (via react-photo-view):
 *  ✅ Pinch-to-zoom / mouse-wheel zoom
 *  ✅ Swipe navigation (mobile + desktop drag)
 *  ✅ Keyboard nav: ←/→ to navigate, Esc to close
 *  ✅ Smooth spring animations
 *  ✅ Toolbar: zoom-in, zoom-out, rotate
 */

import { PhotoSlider } from 'react-photo-view'

import { getImageUrl } from '@/lib/storage'

export interface PhotoGalleryProps {
  /** Array of MinIO object keys (passed through getImageUrl before display) */
  images: string[]
  open: boolean
  currentIndex: number
  onClose: () => void
  onIndexChange?: (index: number) => void
}

export default function PhotoGallery({
  images,
  open,
  currentIndex,
  onClose,
  onIndexChange
}: PhotoGalleryProps) {
  if (!images.length) return null

  return (
    <PhotoSlider
      images={images.map(img => ({ src: getImageUrl(img), key: img }))}
      visible={open}
      onClose={onClose}
      index={currentIndex}
      onIndexChange={onIndexChange}
      loop
      maskOpacity={0.85}
    />
  )
}
