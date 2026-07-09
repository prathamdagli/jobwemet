import {
  AlertTriangle,
  Camera,
  Clock,
  KeyRound,
  LogOut,
  Megaphone,
  MonitorSmartphone,
  Palette,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { SettingRow } from '@/components/settings/settings'

const FULL_NAME = 'Alex Morgan'
const INITIALS = FULL_NAME.split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()
const EMAIL = 'alex.morgan@example.com'
const LAST_UPDATED = 'Jul 9, 2026'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account, security, and notification preferences.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Last updated {LAST_UPDATED}
          </p>
        </div>
        <Button size="lg" className="gap-1.5">
          <Pencil className="size-4" aria-hidden="true" />
          Save Changes
        </Button>
      </header>

      <WidgetCard title="Account" icon={UserRound}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold tracking-tight text-foreground"
              aria-label={`Avatar for ${FULL_NAME}`}
            >
              {INITIALS}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                {FULL_NAME}
              </p>
              <p className="text-sm text-muted-foreground">{EMAIL}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" className="gap-1.5">
              <Pencil className="size-4" aria-hidden="true" />
              Edit Profile
            </Button>
            <Button variant="outline" size="lg" className="gap-1.5">
              <Camera className="size-4" aria-hidden="true" />
              Change Avatar
            </Button>
          </div>
        </div>

        <div className="mt-2 divide-y divide-border border-t border-border">
          <SettingRow
            title="Full Name"
            description="Your display name across JobWeMet."
            htmlFor="fullName"
          >
            <Input id="fullName" defaultValue={FULL_NAME} className="sm:w-72" />
          </SettingRow>
          <SettingRow
            title="Email"
            description="Used for sign-in and account emails."
            htmlFor="email"
          >
            <Input
              id="email"
              type="email"
              defaultValue={EMAIL}
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
              defaultValue="+1 (555) 012-3456"
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
              defaultValue="AI Engineer"
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
              defaultValue="San Francisco, CA"
              className="sm:w-72"
            />
          </SettingRow>
        </div>
      </WidgetCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WidgetCard title="Security" icon={ShieldCheck}>
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
              <div className="flex items-center gap-2">
                <Badge variant="muted">Off</Badge>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </SettingRow>
            <SettingRow
              title="Google Account"
              description="You signed in with Google."
            >
              <Badge variant="secondary">Connected</Badge>
            </SettingRow>
            <SettingRow title="Last Login" description="Most recent session.">
              <span className="text-sm text-muted-foreground">
                Jul 9, 2026 · 14:32
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

        <WidgetCard title="Preferences" icon={Palette}>
          <div className="divide-y divide-border">
            <SettingRow
              title="Theme"
              description="Interface appearance."
              htmlFor="theme"
            >
              <Select id="theme" defaultValue="System" className="sm:w-56">
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
              <Select id="language" defaultValue="English" className="sm:w-56">
                <option>English</option>
                <option>Spanish</option>
                <option>German</option>
                <option>French</option>
              </Select>
            </SettingRow>
            <SettingRow
              title="Default Career Goal"
              description="Used when generating roadmaps."
              htmlFor="goal"
            >
              <Select id="goal" defaultValue="AI Engineer" className="sm:w-56">
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
                defaultValue="Resume-v2.pdf"
                className="sm:w-56"
              >
                <option>Resume-v2.pdf</option>
                <option>Resume-v1.pdf</option>
                <option>No resume</option>
              </Select>
            </SettingRow>
            <SettingRow
              title="Timezone"
              description="Used for reports and reminders."
              htmlFor="timezone"
            >
              <Select
                id="timezone"
                defaultValue="UTC-08:00 Pacific"
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WidgetCard title="Notifications" icon={Megaphone}>
          <div className="divide-y divide-border">
            <SettingRow
              title="Email Notifications"
              description="Receive important account emails."
            >
              <Switch defaultChecked aria-label="Email Notifications" />
            </SettingRow>
            <SettingRow
              title="Career Updates"
              description="Get notified about new career matches."
            >
              <Switch defaultChecked aria-label="Career Updates" />
            </SettingRow>
            <SettingRow
              title="Course Recommendations"
              description="Personalized course suggestions."
            >
              <Switch defaultChecked aria-label="Course Recommendations" />
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

        <WidgetCard title="Danger Zone" icon={AlertTriangle}>
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
            Account deletion is permanent and cannot be undone. All your
            resumes, analyses, and progress will be lost.
          </p>
        </WidgetCard>
      </div>
    </div>
  )
}
