import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { fast } from '@/motion'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <motion.span
      whileHover={{ y: -1 }}
      transition={fast}
      className={cn(badgeVariants({ variant }), className)}
      {...(props as ComponentProps<typeof motion.span>)}
    />
  )
}

export { Badge, badgeVariants }
