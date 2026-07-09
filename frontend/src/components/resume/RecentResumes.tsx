import { FileText, History } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ResumeEntry {
  id: string
  name: string
  uploaded: string
}

export function RecentResumes({ items }: { items: ResumeEntry[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No resumes uploaded yet.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Uploaded · {item.uploaded}
            </p>
          </div>
          <Badge variant="muted" className="shrink-0 gap-1">
            <History className="size-3.5" aria-hidden="true" />
            Uploaded
          </Badge>
        </li>
      ))}
    </ul>
  )
}
