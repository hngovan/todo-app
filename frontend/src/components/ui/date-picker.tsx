import { format, parseISO } from 'date-fns'
import { enUS, vi, ja } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { getStartOfToday, getTodayStr } from '@/lib/date'
import { cn } from '@/lib/utils'

import type { Locale } from 'date-fns'
import type { Locale as DayPickerLocale } from 'react-day-picker'

// Map i18n lang codes → date-fns locale objects
const DATE_FNS_LOCALES: Record<string, Locale> = {
  vi,
  ja,
  en: enUS
}

const TODAY_LABELS: Record<string, string> = {
  vi: 'Hôm nay',
  ja: '今日',
  en: 'Today'
}

interface DatePickerProps {
  value: string // ISO date string "YYYY-MM-DD" or empty string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  disablePast?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disablePast = true
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const { i18n } = useTranslation()

  const langCode = i18n.language?.split('-')[0] ?? 'en'
  const dateFnsLocale = DATE_FNS_LOCALES[langCode] ?? enUS
  const todayLabel = TODAY_LABELS[langCode] ?? 'Today'

  const selected = value ? parseISO(value) : undefined

  const handleSelectToday = () => {
    onChange(getTodayStr())
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start overflow-hidden text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">
            {value
              ? format(parseISO(value), 'PPP', { locale: dateFnsLocale })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={day => {
            onChange(day ? format(day, 'yyyy-MM-dd') : '')
            setOpen(false)
          }}
          locale={dateFnsLocale as unknown as DayPickerLocale}
          disabled={disablePast ? { before: getStartOfToday() } : undefined}
          autoFocus
        />
        {/* Today shortcut */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm"
            onClick={handleSelectToday}
          >
            📅 {todayLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
