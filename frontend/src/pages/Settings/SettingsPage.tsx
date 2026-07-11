import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Megaphone,
  MonitorSmartphone,
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
import type { Settings } from '@/services/api/client'

export default function SettingsPage() {
  const { settings, putSettings } = useAppState()
  const { profile } = useProfile()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
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
              <Button variant="outline" size="sm" className="gap-1.5">
                <Camera className="size-4" aria-hidden="true" />
                Change Avatar
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
              description="Your primary career goal."
              htmlFor="targetCareer"
            >
              <Select
                id="targetCareer"
                value={form.targetCareer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetCareer: e.target.value }))
                }
                className="sm:w-72"
              >
                <option>AI Engineer</option>
                <option>Data Scientist</option>
                <option>ML Engineer</option>
                <option>Backend Developer</option>
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
              description="Change your account password."
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <KeyRound className="size-4" aria-hidden="true" />
                Change Password
              </Button>
            </SettingRow>
            <SettingRow
              title="Two Factor Authentication"
              description="Add a verification step when you sign in."
            >
              <div className="flex items-center justify-end gap-2">
                <Badge variant="muted" size="xs">
                  Off
                </Badge>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Fingerprint className="size-4" aria-hidden="true" />
                  Enable 2FA
                </Button>
              </div>
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
            <SettingRow
              title="Devices"
              description="Review active sessions and devices."
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <MonitorSmartphone className="size-4" aria-hidden="true" />
                Manage Devices
              </Button>
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
            <SettingRow
              title="Weekly Progress Report"
              description="A summary of your learning each week."
            >
              <Switch aria-label="Weekly Progress Report" />
            </SettingRow>
            <SettingRow
              title="Product Announcements"
              description="News about new features and releases."
            >
              <Switch aria-label="Product Announcements" />
            </SettingRow>
          </div>
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
            <SettingRow
              title="Language"
              description="Preferred language for the app."
              htmlFor="language"
            >
              <Select
                id="language"
                value={
                  settingsForm.language === 'es'
                    ? 'Spanish'
                    : settingsForm.language === 'de'
                      ? 'German'
                      : settingsForm.language === 'fr'
                        ? 'French'
                        : 'English'
                }
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    language:
                      e.target.value === 'Spanish'
                        ? 'es'
                        : e.target.value === 'German'
                          ? 'de'
                          : e.target.value === 'French'
                            ? 'fr'
                            : 'en',
                  }))
                }
                className="sm:w-56"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>German</option>
                <option>French</option>
              </Select>
            </SettingRow>
            <SettingRow
              title="Timezone"
              description="Used for reports and reminders."
              htmlFor="timezone"
            >
              <Select
                id="timezone"
                value={settingsForm.timezone ?? 'UTC-08:00 Pacific'}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, timezone: e.target.value }))
                }
                className="sm:w-56"
              >
                <option>UTC-08:00 Pacific</option>
                <option>UTC-05:00 Eastern</option>
                <option>UTC+00:00 GMT</option>
                <option>UTC+01:00 Central Europe</option>
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
          className="lg:col-span-6"
        >
          <div className="divide-y divide-border">
            <SettingRow
              title="Default Career Goal"
              description="Used when generating roadmaps."
              htmlFor="goal"
            >
              <Select
                id="goal"
                value={
                  settingsForm.careerPreferences.targetRole ?? 'AI Engineer'
                }
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    careerPreferences: {
                      ...f.careerPreferences,
                      targetRole: e.target.value,
                    },
                  }))
                }
                className="sm:w-56"
              >
                <option>AI Engineer</option>
                <option>Data Scientist</option>
                <option>ML Engineer</option>
              </Select>
            </SettingRow>
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
            <SettingRow
              title="Auto-generate Roadmaps"
              description="Build a roadmap whenever you set a new goal."
            >
              <Switch defaultChecked aria-label="Auto-generate Roadmaps" />
            </SettingRow>
            <SettingRow
              title="Smart Skill Analysis"
              description="Use AI to surface gaps from your resume."
            >
              <Switch defaultChecked aria-label="Smart Skill Analysis" />
            </SettingRow>
          </div>
        </WidgetCard>

        <WidgetCard title="Privacy" icon={Lock} className="lg:col-span-6">
          <div className="divide-y divide-border">
            <SettingRow
              title="Public Profile"
              description="Make your profile visible to recruiters."
            >
              <Switch
                checked={settingsForm.privacy.profileVisible}
                onCheckedChange={(v) =>
                  setSettingsForm((f) => ({
                    ...f,
                    privacy: { ...f.privacy, profileVisible: v },
                  }))
                }
                aria-label="Public Profile"
              />
            </SettingRow>
            <SettingRow
              title="Share Usage Data"
              description="Help improve JobWeMet with anonymous data."
            >
              <Switch
                checked={settingsForm.privacy.shareAcademicData}
                onCheckedChange={(v) =>
                  setSettingsForm((f) => ({
                    ...f,
                    privacy: { ...f.privacy, shareAcademicData: v },
                  }))
                }
                aria-label="Share Usage Data"
              />
            </SettingRow>
            <SettingRow
              title="Email Discoverability"
              description="Let teammates find you by email."
            >
              <Switch aria-label="Email Discoverability" />
            </SettingRow>
            <SettingRow
              title="Personalized Opportunities"
              description="Show roles matched to your skills."
            >
              <Switch defaultChecked aria-label="Personalized Opportunities" />
            </SettingRow>
          </div>
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
            <Button variant="outline" size="sm" className="gap-1.5">
              <LogOut className="size-4" aria-hidden="true" />
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
