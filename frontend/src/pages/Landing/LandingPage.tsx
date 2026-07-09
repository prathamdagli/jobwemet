import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight">JobWeMet</h1>
      <p className="text-lg text-muted-foreground">
        AI-Powered Career Intelligence Platform
      </p>
      <Button>Get Started</Button>
    </div>
  )
}
