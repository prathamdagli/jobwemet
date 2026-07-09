import { Link } from 'react-router-dom'
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Clock,
  Code,
  FileText,
  Gauge,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  Upload,
  User,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { InsightRow } from '@/components/careers/careers'
import { MetricTile, type TechnicalSkill } from '@/components/skills/skills'

const FULL_NAME = 'Alex Morgan'
const INITIALS = FULL_NAME.split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()
const EMAIL = 'alex.morgan@example.com'
const TARGET_CAREER = 'AI Engineer'
const LOCATION = 'San Francisco, CA'
const MEMBER_SINCE = 'Mar 2025'
const PROFILE_COMPLETION = 78
const LAST_UPDATED = 'Jul 9, 2026'

const CAREER_SUMMARY = [
  {
    label: 'Career Readiness',
    value: '84%',
    sub: 'Strong alignment',
    icon: Gauge,
  },
  {
    label: 'Current Career Goal',
    value: TARGET_CAREER,
    sub: 'In progress',
    icon: Target,
  },
  {
    label: 'Top Career Match',
    value: '92%',
    sub: 'AI Engineer',
    icon: Sparkles,
  },
  {
    label: 'Skills Identified',
    value: '18',
    sub: 'Across 5 domains',
    icon: Layers,
  },
  {
    label: 'Missing Skills',
    value: '7',
    sub: 'Cloud, DevOps, AI',
    icon: Briefcase,
  },
]

const PERSONAL_INFO = [
  { icon: User, label: 'Full Name', value: FULL_NAME },
  { icon: Mail, label: 'Email', value: EMAIL },
  { icon: Phone, label: 'Phone', value: '+1 (555) 012-3456' },
  { icon: GraduationCap, label: 'University', value: 'Stanford University' },
  { icon: BookOpen, label: 'Degree', value: 'B.S. Computer Science' },
  { icon: CalendarDays, label: 'Graduation Year', value: '2024' },
]

const CAREER_STATS = [
  { icon: FileText, label: 'Resumes Uploaded', value: '3' },
  { icon: Briefcase, label: 'Career Matches Generated', value: '42' },
  { icon: GraduationCap, label: 'Courses Completed', value: '8' },
  { icon: Route, label: 'Roadmaps Generated', value: '2' },
  { icon: Clock, label: 'Hours Learned', value: '64' },
]

const TOP_SKILLS: TechnicalSkill[] = [
  { name: 'Python', category: 'Programming', confidence: 95 },
  { name: 'React', category: 'Frameworks', confidence: 91 },
  { name: 'SQL', category: 'Programming', confidence: 88 },
  { name: 'Machine Learning', category: 'AI', confidence: 84 },
  { name: 'Git', category: 'Tools', confidence: 90 },
]

const ACHIEVEMENTS = [
  {
    icon: FileText,
    title: 'First Resume Uploaded',
    description: 'You uploaded your first resume and started your journey.',
    unlocked: true,
  },
  {
    icon: Sparkles,
    title: 'AI Analysis Completed',
    description: 'Your skills were analyzed and matched to target careers.',
    unlocked: true,
  },
  {
    icon: Route,
    title: 'Career Roadmap Generated',
    description: 'A personalized learning roadmap was created for you.',
    unlocked: true,
  },
  {
    icon: Clock,
    title: '100 Learning Hours',
    description: 'Reach 100 hours of guided learning across courses.',
    unlocked: false,
  },
  {
    icon: Award,
    title: 'Career Ready 80%',
    description: 'Hit 80% career readiness for your target role.',
    unlocked: false,
  },
]

const ACTIVITY = [
  { icon: FileText, title: 'Resume Uploaded', time: '2 days ago' },
  { icon: Sparkles, title: 'AI Analysis Completed', time: '2 days ago' },
  { icon: Briefcase, title: 'Career Matches Generated', time: '1 day ago' },
  { icon: Route, title: 'Learning Roadmap Updated', time: '5 hours ago' },
  { icon: BookOpen, title: 'Started Docker Course', time: '1 hour ago' },
]

const QUICK_ACTIONS = [
  { icon: Upload, label: 'Upload Resume', to: '/resume' },
  { icon: RefreshCw, label: 'Analyze Again', to: '/skills' },
  { icon: Route, label: 'View Roadmap', to: '/roadmap' },
  { icon: GraduationCap, label: 'Browse Courses', to: '/courses' },
]

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your personal career dashboard and account overview.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Last updated {LAST_UPDATED}
          </p>
        </div>
        <Button size="lg" className="gap-1.5">
          <Pencil className="size-4" aria-hidden="true" />
          Edit Profile
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <WidgetCard title="Profile" icon={UserRound} className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div
              className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold tracking-tight text-foreground"
              aria-label={`Avatar for ${FULL_NAME}`}
            >
              {INITIALS}
            </div>
            <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              {FULL_NAME}
            </p>
            <p className="text-sm text-muted-foreground">{EMAIL}</p>
          </div>

          <dl className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Target className="size-4 shrink-0" aria-hidden="true" />
                Target Career
              </dt>
              <dd className="font-medium text-foreground">{TARGET_CAREER}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                Location
              </dt>
              <dd className="font-medium text-foreground">{LOCATION}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                Member Since
              </dt>
              <dd className="font-medium text-foreground">{MEMBER_SINCE}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <ProgressBar
              value={PROFILE_COMPLETION}
              label="Profile Completion"
              showValue
            />
          </div>

          <Button size="lg" variant="outline" className="mt-5 w-full gap-1.5">
            <Pencil className="size-4" aria-hidden="true" />
            Edit Profile
          </Button>
        </WidgetCard>

        <WidgetCard
          title="Career Summary"
          icon={Sparkles}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CAREER_SUMMARY.map((item) => (
              <MetricTile
                key={item.label}
                label={item.label}
                value={item.value}
                sub={item.sub}
                icon={item.icon}
              />
            ))}
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <WidgetCard title="Personal Information" icon={User}>
          <ul className="space-y-3">
            {PERSONAL_INFO.map((item) => (
              <InsightRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard title="Career Statistics" icon={Gauge}>
          <ul className="space-y-3">
            {CAREER_STATS.map((item) => (
              <InsightRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard title="Skills Overview" icon={Code}>
          <p className="mb-3 text-xs text-muted-foreground">Top Skills</p>
          <div className="flex flex-wrap gap-2">
            {TOP_SKILLS.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground"
              >
                {skill.name}
                <span className="text-xs font-normal text-muted-foreground">
                  {skill.confidence}%
                </span>
              </span>
            ))}
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WidgetCard title="Achievements" icon={Award}>
          <ul className="space-y-3">
            {ACHIEVEMENTS.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background">
                  <item.icon
                    className="size-4 text-foreground"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <Badge variant={item.unlocked ? 'secondary' : 'muted'}>
                      {item.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard title="Recent Activity" icon={Clock}>
          <ol className="relative space-y-5">
            {ACTIVITY.map((item, index) => (
              <li key={item.title} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                    <item.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </span>
                  {index !== ACTIVITY.length - 1 && (
                    <span
                      className="mt-1 w-px flex-1 bg-border"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ol>
        </WidgetCard>
      </div>

      <WidgetCard title="Quick Actions" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="lg"
              className="gap-1.5"
              render={<Link to={action.to} />}
            >
              <action.icon className="size-4" aria-hidden="true" />
              {action.label}
            </Button>
          ))}
        </div>
      </WidgetCard>
    </div>
  )
}
