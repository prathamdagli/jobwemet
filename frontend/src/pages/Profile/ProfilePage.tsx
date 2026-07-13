import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  Code,
  Gauge,
  Lock,
  MapPin,
  Pencil,
  Sparkles,
  Target,
  User,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { InsightRow } from '@/components/careers/careers'
import {
  Stagger,
  listReveal,
  timelineReveal,
  staggerContainer,
  useCountUp,
} from '@/motion'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const {
    profile,
    careerSummary,
    personalInfo,
    careerStats,
    topSkills,
    achievements,
    activity,
    quickActions,
  } = useProfile()
  const { user } = useAuth()

  const completion = Math.round(useCountUp(profile.profileCompletion))
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Profile"
        title={profile.fullName}
        description={`Pursuing ${profile.targetCareer} · based in ${profile.location}.`}
        lastUpdated={profile.lastUpdated}
        action={
          <Link to="/settings">
            <Button size="sm" className="gap-1.5">
              <Pencil className="size-4" aria-hidden="true" />
              Edit Profile
            </Button>
          </Link>
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            Target:{' '}
            <span className="font-medium text-foreground">
              {profile.targetCareer}
            </span>
          </span>
        }
      />

      {/* Dominant — Profile Overview (two-column feature card) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          title="Profile Overview"
          icon={UserRound}
          variant="feature"
          padding="lg"
          className="lg:col-span-8"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Identity */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={`${profile.fullName} profile photo`}
                    className="size-20 shrink-0 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div
                    className="flex size-20 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold tracking-tight text-foreground"
                    aria-label={`Avatar for ${profile.fullName}`}
                  >
                    {profile.initials}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {profile.fullName}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Target className="size-3.5 shrink-0" aria-hidden="true" />
                    {profile.targetCareer}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <MapPin
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">Based in</span>
                  <span className="font-medium text-foreground">
                    {profile.location}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CalendarDays
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium text-foreground">
                    {profile.memberSince}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <User
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate font-medium text-foreground">
                    {profile.email}
                  </span>
                </div>
              </dl>
            </div>

            {/* Career Summary panel */}
            <div className="sm:border-l sm:border-border sm:pl-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Career Summary
              </p>
              <Stagger className="grid grid-cols-2 gap-3">
                {careerSummary.map((item) => (
                  <MetricCard
                    key={item.label}
                    variant="sm"
                    label={item.label}
                    value={item.value}
                    sub={item.sub}
                    icon={item.icon}
                  />
                ))}
              </Stagger>
            </div>
          </div>
        </WidgetCard>

        {/* Profile Completion / status */}
        <WidgetCard
          title="Profile Completion"
          icon={Sparkles}
          variant="muted"
          className="lg:col-span-4"
        >
          <div className="flex flex-col">
            <p className="text-4xl font-semibold tracking-tight text-foreground">
              {completion}%
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                complete
              </span>
            </p>
            <div className="mt-4">
              <ProgressBar
                value={profile.profileCompletion}
                label="Profile completion"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Keep your profile up to date to unlock stronger career matches.
            </p>
          </div>
        </WidgetCard>
      </div>

      {/* Three supporting columns */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          title="Personal Information"
          icon={User}
          className="lg:col-span-4"
        >
          <ul className="space-y-3">
            {personalInfo.map((item) => (
              <InsightRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard
          title="Career Statistics"
          icon={Gauge}
          className="lg:col-span-4"
        >
          <ul className="space-y-3">
            {careerStats.map((item) => (
              <InsightRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard
          title="Skills Overview"
          icon={Code}
          className="lg:col-span-4"
        >
          <p className="mb-3 text-xs text-muted-foreground">Top Skills</p>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-sm font-medium text-foreground"
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

      {/* Achievements + Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WidgetCard
          title="Achievements"
          icon={Award}
          action={
            <Badge variant="soft" size="xs">
              {unlockedCount}/{achievements.length} unlocked
            </Badge>
          }
        >
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-3"
          >
            {achievements.map((item) => (
              <motion.li
                key={item.title}
                variants={listReveal}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
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
                    {item.unlocked ? (
                      <Badge variant="soft" size="xs">
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="muted" size="xs">
                        <Lock className="size-3" aria-hidden="true" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </WidgetCard>

        <WidgetCard title="Recent Activity" icon={Clock}>
          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative space-y-5"
          >
            {activity.map((item, index) => (
              <motion.li
                key={item.title}
                variants={timelineReveal}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                    <item.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </span>
                  {index !== activity.length - 1 && (
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
              </motion.li>
            ))}
          </motion.ol>
        </WidgetCard>
      </div>

      {/* Quick Actions */}
      <WidgetCard title="Quick Actions" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
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
