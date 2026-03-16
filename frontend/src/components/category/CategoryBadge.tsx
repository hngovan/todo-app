import { isImageKey } from '@/lib/attachment.utils'
import { getThumbnailUrl } from '@/lib/storage'
import type { Category } from '@/types'

interface CategoryBadgeProps {
  category: Category
  className?: string
}

export default function CategoryBadge({
  category,
  className = ''
}: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${category.color}22`,
        color: category.color,
        border: `1px solid ${category.color}55`
      }}
    >
      {category.icon && (
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          {isImageKey(category.icon) ? (
            <img
              src={getThumbnailUrl(category.icon)}
              alt=""
              className="h-full w-full rounded-sm object-cover"
            />
          ) : (
            <span>{category.icon}</span>
          )}
        </span>
      )}
      <span className="max-w-[160px] truncate">{category.name}</span>
    </span>
  )
}
