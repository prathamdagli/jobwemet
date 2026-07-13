import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { EmptyState } from '@/components/common/EmptyState'
import { Stagger, listReveal } from '@/motion'
import { cn } from '@/lib/utils'

export type ResumeStatus = 'Parsed' | 'Processing' | 'Failed'

export interface ResumeEntry {
  id: string
  name: string
  uploaded: string
  status?: ResumeStatus
  preview?: string
}

const STATUS_META: Record<
  ResumeStatus,
  { variant: 'soft' | 'muted' | 'outline'; icon: LucideIcon; label: string }
> = {
  Parsed: { variant: 'soft', icon: CheckCircle2, label: 'Parsed' },
  Processing: { variant: 'muted', icon: Loader2, label: 'Processing' },
  Failed: { variant: 'outline', icon: AlertTriangle, label: 'Failed' },
}

import { useAppState } from '@/hooks/useAppState'
import { Trash2 } from 'lucide-react'

function ResumeCard({ item }: { item: ResumeEntry }) {
  const status = item.status ?? 'Parsed'
  const meta = STATUS_META[status]
  const Icon = meta.icon
  const isProcessing = status === 'Processing'
  const { deleteResume } = useAppState()
  const [fakeProgress, setFakeProgress] = useState(0)

  useEffect(() => {
    if (!isProcessing) return
    const duration = 12000
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(95, Math.floor((elapsed / duration) * 100))
      setFakeProgress(pct)
    }, 500)
    return () => clearInterval(timer)
  }, [isProcessing])

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/15 hover:shadow-md sm:flex-row sm:items-center">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {'\u{1F4C4}'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground pr-8">
            {item.name}
          </p>
          <Badge variant={meta.variant} size="xs" className="shrink-0 gap-1">
            <Icon
              className={cn('size-3.5', isProcessing && 'animate-spin')}
              aria-hidden="true"
            />
            {meta.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Uploaded · {item.uploaded}
        </p>
        {item.preview ? (
          <p className="mt-2 line-clamp-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
            {item.preview}
          </p>
        ) : null}
        {isProcessing && (
          <ProgressBar
            value={fakeProgress}
            size="sm"
            label="Extracting details…"
            showValue
            className="mt-2"
          />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void deleteResume(item.id)}
        className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:static sm:opacity-100 sm:ml-2"
        aria-label="Delete resume"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function RecentResumes({
  items,
  onUpload,
}: {
  items: ResumeEntry[]
  onUpload?: () => void
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes uploaded yet"
        description="Drop your resume above and our AI will extract your skills, experience, and education automatically."
        action={
          onUpload ? (
            <Button size="sm" className="mt-1 gap-1.5" onClick={onUpload}>
              <UploadCloud className="size-4" aria-hidden="true" />
              Upload resume
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <Stagger>
      <ul className="space-y-4">
        {items.map((item) => (
          <motion.li key={item.id} variants={listReveal}>
            <ResumeCard item={item} />
          </motion.li>
        ))}
      </ul>
    </Stagger>
  )
}
