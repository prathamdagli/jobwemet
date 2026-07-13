import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { getAuthErrorMessage } from '@/utils/firebaseErrors'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div>
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-success-500/10 text-success-600">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We sent a password reset link to
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setSent(false)}
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? 'Sending…' : 'Resend email'}
        </Button>

        <Link
          to="/login"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </header>

      {error && (
        <div
          id="forgot-error"
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'forgot-error' : undefined}
              disabled={loading}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? 'Sending…' : 'Send reset email'}
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  )
}
