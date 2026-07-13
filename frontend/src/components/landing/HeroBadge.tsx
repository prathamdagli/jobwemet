import { Sparkles } from 'lucide-react'

export default function HeroBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-primary" />
      <Sparkles className="size-4 text-primary" />
      AI Career Copilot
    </span>
  )
}
