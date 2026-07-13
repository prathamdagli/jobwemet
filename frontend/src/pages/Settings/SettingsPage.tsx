import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  LogOut,
  Megaphone,
  Palette,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SettingRow } from '@/components/settings/settings'
import { useAppState } from '@/hooks/useAppState'
import { useProfile } from '@/hooks/useProfile'
import { useCareerMatches } from '@/hooks/useCareerMatches'
import { useAuth } from '@/hooks/useAuth'
import type { Settings } from '@/services/api/client'

export default function SettingsPage() {
  const { settings, putSettings } = useAppState()
  const { profile } = useProfile()
  const { careers } = useCareerMatches()
  const { logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Career-goal options: AI matches merged with a comprehensive default set, plus the
  // currently-saved value so a custom goal is never dropped from the list.
  const predefinedCareers = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Data Scientist',
    'Data Engineer',
    'ML Engineer',
    'AI Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
  ]

  const rawOptions = [
    'Not Set',
    ...careers.map((c) => c.title),
    ...predefinedCareers,
    profile.targetCareer,
  ].filter((t): t is string => Boolean(t && t.trim()))

  const seen = new Set<string>()
  const careerOptions: string[] = []

  for (const option of rawOptions) {
    const normalized = option.toLowerCase().trim()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      careerOptions.push(option.trim())
    }
  }

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      setLoggingOut(false)
    }
  }
  const [form, setForm] = useState({
    fullName: profile.fullName,
    phone: profile.phone ?? '',
    targetCareer: profile.targetCareer,
    location: profile.location,
  })

  // Re-sync from the profile only when the underlying values actually change
  // (e.g. after a save round-trips through the realtime listener), so typing
  // in the inputs is never clobbered by unrelated data updates.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      targetCareer: profile.targetCareer,
      location: profile.location,
    })
  }, [profile.fullName, profile.phone, profile.targetCareer, profile.location])

  const defaultSettings: Settings = {
    theme: 'system',
    language: 'en',
    timezone: null,
    notifications: { email: true, push: true, browser: true },
    privacy: { profileVisible: true, shareAcademicData: true },
    careerPreferences: {
      targetRole: null,
      industry: null,
      remotePreferred: false,
    },
    defaultResume: null,
  }
  const [settingsForm, setSettingsForm] = useState<Settings>(defaultSettings)

  // Sync the persisted settings into local state when the app data refreshes.
  useEffect(() => {
    if (!settings) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettingsForm({
      theme: settings.theme ?? 'system',
      language: settings.language ?? 'en',
      timezone: settings.timezone ?? null,
      notifications: {
        email: settings.notifications?.email ?? true,
        push: settings.notifications?.push ?? true,
        browser: settings.notifications?.browser ?? true,
      },
      privacy: {
        profileVisible: settings.privacy?.profileVisible ?? true,
        shareAcademicData: settings.privacy?.shareAcademicData ?? true,
      },
      careerPreferences: {
        targetRole: settings.careerPreferences?.targetRole ?? null,
        industry: settings.careerPreferences?.industry ?? null,
        remotePreferred: settings.careerPreferences?.remotePreferred ?? false,
      },
      defaultResume: settings.defaultResume ?? null,
    })
  }, [settings])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await putSettings({
        displayName: form.fullName,
        targetCareer: form.targetCareer,
        location: form.location,
        phone: form.phone,
        theme: settingsForm.theme,
        language: settingsForm.language,
        timezone: settingsForm.timezone,
        notifications: settingsForm.notifications,
        privacy: settingsForm.privacy,
        careerPreferences: settingsForm.careerPreferences,
        defaultResume: settingsForm.defaultResume,
      })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const remaining = Math.max(0, 100 - profile.profileCompletion)

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Your account & preferences"
        description="Manage your profile, security, and how JobWeMet works for you — all in one place."
        lastUpdated={profile.lastUpdated}
        action={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Pencil className="size-4" aria-hidden="true" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground">Account secure</span>
          </span>
        }
      />

      {/* Dominant element — personal account anchor */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard variant="feature" padding="lg" className="lg:col-span-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex size-20 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-2xl font-semibold tracking-tight text-foreground ring-1 ring-foreground/10"
                aria-label={`Avatar for ${profile.fullName}`}
              >
                {profile.initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {profile.fullName}
                  </p>
                  <Badge variant="soft" size="xs">
                    Pro member
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {profile.email}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Last active {profile.lastUpdated}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleSave}
                disabled={saving}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit Profile
              </Button>
            </div>
          </div>
        </WidgetCard>

        <MetricCard
          variant="lg"
          label="Profile completeness"
          value={`${profile.profileCompletion}%`}
          sub={`${remaining}% to completion`}
          icon={UserRound}
          className="lg:col-span-4"
        />
      </div>

      {/* Account + Security */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard title="Account" icon={UserRound} className="lg:col-span-7">
          <div className="divide-y divide-border">
            <SettingRow
              title="Full Name"
              description="Your display name across JobWeMet."
              htmlFor="fullName"
            >
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="sm:w-72"
              />
            </SettingRow>
            <SettingRow
              title="Email"
              description="Used for sign-in and account emails."
              htmlFor="email"
            >
              <Input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="sm:w-72"
              />
            </SettingRow>
            <SettingRow
              title="Phone Number"
              description="Optional contact number."
              htmlFor="phone"
            >
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="sm:w-72"
              />
            </SettingRow>
            <SettingRow
              title="Target Career"
              description="Your primary goal — saving re-plans your roadmap & courses."
              htmlFor="targetCareer"
            >
              <Select
                id="targetCareer"
                value={form.targetCareer || 'Not Set'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    targetCareer:
                      e.target.value === 'Not Set' ? '' : e.target.value,
                  }))
                }
                className="sm:w-72"
              >
                {careerOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <SettingRow
              title="Location"
              description="Used to tailor local opportunities."
              htmlFor="location"
            >
              <Input
                id="location"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                className="sm:w-72"
              />
            </SettingRow>
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 flex items-center gap-1.5 text-sm text-destructive"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          {saved && !error && (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-foreground">
              <CheckCircle2
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              Changes saved.
            </p>
          )}
        </WidgetCard>

        <WidgetCard
          title="Security"
          icon={ShieldCheck}
          className="lg:col-span-5"
        >
          <div className="divide-y divide-border">
            <SettingRow
              title="Password"
              description="Managed by your Google sign-in provider."
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled
                title="Managed by your sign-in provider"
              >
                <KeyRound className="size-4" aria-hidden="true" />
                Change Password
              </Button>
            </SettingRow>
            <SettingRow
              title="Google Account"
              description="You signed in with Google."
            >
              <Badge variant="secondary" size="xs">
                Connected
              </Badge>
            </SettingRow>
            <SettingRow title="Last Login" description="Most recent session.">
              <span className="text-sm text-muted-foreground">
                {profile.lastUpdated} · recent
              </span>
            </SettingRow>
          </div>
        </WidgetCard>
      </div>

      {/* Notifications + Appearance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          title="Notifications"
          icon={Megaphone}
          className="lg:col-span-6"
        >
          <div className="divide-y divide-border">
            <SettingRow
              title="Email Notifications"
              description="Receive important account emails."
            >
              <Switch
                checked={settingsForm.notifications.email}
                onCheckedChange={(v) =>
                  setSettingsForm((f) => ({
                    ...f,
                    notifications: { ...f.notifications, email: v },
                  }))
                }
                aria-label="Email Notifications"
              />
            </SettingRow>
            <SettingRow
              title="Career Updates"
              description="Get notified about new career matches."
            >
              <Switch
                checked={settingsForm.notifications.push}
                onCheckedChange={(v) =>
                  setSettingsForm((f) => ({
                    ...f,
                    notifications: { ...f.notifications, push: v },
                  }))
                }
                aria-label="Career Updates"
              />
            </SettingRow>
            <SettingRow
              title="Course Recommendations"
              description="Personalized course suggestions."
            >
              <Switch
                checked={settingsForm.notifications.browser}
                onCheckedChange={(v) =>
                  setSettingsForm((f) => ({
                    ...f,
                    notifications: { ...f.notifications, browser: v },
                  }))
                }
                aria-label="Course Recommendations"
              />
            </SettingRow>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Notification channels are saved to your account. Email digests land
            in your inbox; push and in-app alerts surface here as they ship.
          </p>
        </WidgetCard>

        <WidgetCard title="Appearance" icon={Palette} className="lg:col-span-6">
          <div className="divide-y divide-border">
            <SettingRow
              title="Theme"
              description="Interface appearance."
              htmlFor="theme"
            >
              <Select
                id="theme"
                value={
                  settingsForm.theme === 'light'
                    ? 'Light'
                    : settingsForm.theme === 'dark'
                      ? 'Dark'
                      : 'System'
                }
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    theme:
                      e.target.value === 'Light'
                        ? 'light'
                        : e.target.value === 'Dark'
                          ? 'dark'
                          : 'system',
                  }))
                }
                className="sm:w-56"
              >
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </Select>
            </SettingRow>
          </div>
        </WidgetCard>
      </div>

      {/* AI Preferences + Privacy */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          title="AI Preferences"
          icon={Sparkles}
          className="lg:col-span-12"
        >
          <div className="divide-y divide-border">
            <SettingRow
              title="Default Resume"
              description="Preselected for skill analysis."
              htmlFor="resume"
            >
              <Select
                id="resume"
                value={
                  settingsForm.defaultResume ? 'Latest resume' : 'No resume'
                }
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    defaultResume:
                      e.target.value === 'Latest resume' ? 'latest' : '',
                  }))
                }
                className="sm:w-56"
              >
                <option>Latest resume</option>
                <option>No resume</option>
              </Select>
            </SettingRow>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            A new goal re-runs the AI pipeline — analysis, gaps, roadmap, and
            courses are regenerated to match.
          </p>
        </WidgetCard>
      </div>

      {/* Danger Zone — full width, muted with a subtle destructive border */}
      <WidgetCard
        title="Danger Zone"
        icon={AlertTriangle}
        variant="muted"
        className="!border-destructive/40"
      >
        <div className="divide-y divide-border">
          <SettingRow
            title="Log Out"
            description="End your session on this device."
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              Log Out
            </Button>
          </SettingRow>
          <SettingRow
            title="Delete Account"
            description="Permanently remove your account and data."
          >
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              disabled
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete Account
            </Button>
          </SettingRow>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Account deletion is permanent and cannot be undone. All your resumes,
          analyses, and progress will be lost.
        </p>
      </WidgetCard>
    </div>
  )
}
