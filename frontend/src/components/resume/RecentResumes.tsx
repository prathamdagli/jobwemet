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

function ResumeCard({ item }: { item: ResumeEntry }) {
  const status = item.status ?? 'Parsed'
  const meta = STATUS_META[status]
  const Icon = meta.icon
  const isProcessing = status === 'Processing'

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/15 sm:flex-row sm:items-center">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <FileText className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
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
            value={72}
            size="sm"
            label="Extracting details…"
            showValue
            className="mt-2"
          />
        )}
      </div>
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
      <ul className="space-y-3">
        {items.map((item) => (
          <motion.li key={item.id} variants={listReveal}>
            <ResumeCard item={item} />
          </motion.li>
        ))}
      </ul>
    </Stagger>
  )
}
