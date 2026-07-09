import { Sparkles } from 'lucide-react'

export default function HeroBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
      <Sparkles className="size-4 text-primary" />
      AI Powered Career Intelligence
    </span>
  )
}
