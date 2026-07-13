import * as React from 'react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    data-slot="checkbox"
    className={cn(
      'size-4 shrink-0 cursor-pointer rounded border border-input bg-background accent-primary outline-none transition-colors',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
