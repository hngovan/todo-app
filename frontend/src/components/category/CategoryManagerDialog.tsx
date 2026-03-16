import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { isImageKey } from '@/lib/attachment.utils'
import { getThumbnailUrl } from '@/lib/storage'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '@/types'

import CategoryFormDialog from './CategoryFormDialog'

interface CategoryManagerDialogProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  onSave: (
    payload: CreateCategoryPayload | UpdateCategoryPayload,
    id?: string
  ) => Promise<void>
  onDelete: (category: Category) => Promise<void>
}

export default function CategoryManagerDialog({
  open,
  onClose,
  categories,
  onSave,
  onDelete
}: CategoryManagerDialogProps) {
  const { t } = useTranslation('common')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  )
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  )

  const handleOpenForm = (category?: Category) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleSaveWrapper = async (
    payload: CreateCategoryPayload | UpdateCategoryPayload
  ) => {
    await onSave(payload, editingCategory?.id)
    setFormOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    await onDelete(deletingCategory)
    setDeletingCategory(null)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="flex max-h-[85vh] flex-col sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {t('manageCategories', 'Manage Categories')}
            </DialogTitle>
            <Button size="sm" onClick={() => handleOpenForm()} className="mr-8">
              <Plus className="mr-1.5 h-4 w-4" />{' '}
              {t('addCategory', 'Add Category')}
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-2">
          {categories.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
              {t('noCategories')}
            </div>
          ) : (
            categories.map(cat => (
              <div
                key={cat.id}
                className="hover:bg-accent/40 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md text-lg"
                    style={{
                      backgroundColor: `${cat.color}22`,
                      color: cat.color
                    }}
                  >
                    {cat.icon ? (
                      isImageKey(cat.icon) ? (
                        <img
                          src={getThumbnailUrl(cat.icon)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        cat.icon
                      )
                    ) : (
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </div>
                  <span className="max-w-[200px] truncate text-sm font-medium">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                    onClick={() => handleOpenForm(cat)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80 h-8 w-8"
                    onClick={() => setDeletingCategory(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>

      <CategoryFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveWrapper}
        initial={editingCategory}
      />

      <ConfirmDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title={t('deleteCategory', 'Delete Category')}
        description={t(
          'deleteCategoryConfirm',
          'Are you sure you want to delete this category? Tasks in this category will not be deleted.'
        )}
        confirmText={t('delete', 'Delete')}
        cancelText={t('cancel', 'Cancel')}
      />
    </Dialog>
  )
}
