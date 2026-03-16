import { Clock } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  id?: string
  value: string // "HH:mm"
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimePicker({
  id,
  value,
  onChange,
  disabled,
  className
}: TimePickerProps) {
  const { i18n } = useTranslation()
  const [open, setOpen] = React.useState(false)

  // Internal state for 12h selection
  const [h12, setH12] = React.useState('12')
  const [minute, setMinute] = React.useState('00')
  const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM')

  // sync internal state when value or open state changes
  React.useEffect(() => {
    if (open) {
      const [h24Str, mStr] = value ? value.split(':') : ['00', '00']
      const h24 = parseInt(h24Str)
      const p = h24 >= 12 ? 'PM' : 'AM'
      let h = h24 % 12
      if (h === 0) h = 12

      setH12(h.toString().padStart(2, '0'))
      setMinute(mStr)
      setPeriod(p)
    }
  }, [open, value])

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  )
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  )

  const handleNow = () => {
    const now = new Date()
    const h = now.getHours().toString().padStart(2, '0')
    const m = Math.floor((now.getMinutes() / 5) * 5)
      .toString()
      .padStart(2, '0')
    onChange(`${h}:${m}`)
    setOpen(false)
  }

  const handleOk = () => {
    let h24 = parseInt(h12)
    if (period === 'PM' && h24 < 12) h24 += 12
    if (period === 'AM' && h24 === 12) h24 = 0
    onChange(`${h24.toString().padStart(2, '0')}:${minute}`)
    setOpen(false)
  }

  const formatDisplayTime = (time: string) => {
    if (!time) return 'Select time'
    const [h, m] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(h))
    date.setMinutes(parseInt(m))
    const lang = i18n.language?.split('-')[0] ?? 'en'
    return date.toLocaleString(
      lang === 'vi' ? 'vi-VN' : lang === 'ja' ? 'ja-JP' : 'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-start px-3 text-left font-normal',
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 opacity-50" />
          {formatDisplayTime(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 shadow-xl" align="start">
        <div className="flex h-[240px] flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden border-b">
            {/* Hours Column */}
            <div
              className="flex-1 overflow-y-auto py-1 selection:bg-transparent"
              onWheel={e => e.stopPropagation()}
            >
              {hours.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setH12(h)}
                  className={cn(
                    'hover:bg-accent flex w-full items-center justify-center py-1.5 text-sm transition-colors focus:outline-none',
                    h12 === h && 'bg-primary/20 text-primary font-bold'
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="bg-border w-px" />
            {/* Minutes Column */}
            <div
              className="flex-1 overflow-y-auto py-1 selection:bg-transparent"
              onWheel={e => e.stopPropagation()}
            >
              {minutes
                .filter(m => parseInt(m) % 5 === 0)
                .map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinute(m)}
                    className={cn(
                      'hover:bg-accent flex w-full items-center justify-center py-1.5 text-sm transition-colors focus:outline-none',
                      minute === m && 'bg-primary/20 text-primary font-bold'
                    )}
                  >
                    {m}
                  </button>
                ))}
            </div>
            <div className="bg-border w-px" />
            {/* AM/PM Column */}
            <div
              className="flex-1 overflow-y-auto py-1 selection:bg-transparent"
              onWheel={e => e.stopPropagation()}
            >
              {(['AM', 'PM'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'hover:bg-accent flex w-full items-center justify-center py-3 text-xs font-bold transition-colors focus:outline-none',
                    period === p && 'bg-primary/20 text-primary'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/20 flex items-center justify-between p-2 pt-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10 h-8 px-2 text-xs font-semibold"
              onClick={handleNow}
            >
              Now
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-4 text-xs font-bold shadow-sm"
              onClick={handleOk}
            >
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
