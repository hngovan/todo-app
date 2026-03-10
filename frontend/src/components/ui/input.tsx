import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button } from './button'

const Input = ({
  ref,
  className,
  type,
  ...props
}: React.ComponentProps<'input'> & {
  ref?: React.Ref<HTMLInputElement | null>
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="relative">
      <input
        type={inputType}
        className={cn(
          'border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          isPassword && 'pr-10',
          className
        )}
        ref={ref}
        {...props}
      />

      {isPassword && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="text-muted-foreground h-4 w-4" />
          ) : (
            <Eye className="text-muted-foreground h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}
Input.displayName = 'Input'

export { Input }
