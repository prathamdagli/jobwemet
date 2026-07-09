import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  'aria-label'?: string
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      defaultChecked = false,
      checked,
      onCheckedChange,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = checked !== undefined
    const [internal, setInternal] = React.useState(defaultChecked)
    const value = isControlled ? checked : internal

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        data-slot="switch"
        onClick={() => {
          if (disabled) return
          const next = !value
          if (!isControlled) setInternal(next)
          onCheckedChange?.(next)
        }}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent outline-none transition-colors',
          'focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          value ? 'bg-foreground' : 'bg-muted',
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none ml-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-200',
            value && 'translate-x-5',
          )}
        />
      </button>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
