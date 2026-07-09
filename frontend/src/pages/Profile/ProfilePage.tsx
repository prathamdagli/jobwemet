import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Award,
  CalendarDays,
  Clock,
  Code,
  Gauge,
  MapPin,
  Pencil,
  Sparkles,
  Target,
  User,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { InsightRow } from '@/components/careers/careers'
import { MetricTile } from '@/components/skills/skills'
import { Reveal, listReveal, staggerContainer, timelineReveal } from '@/motion'
import { useProfile } from '@/hooks/useProfile'

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
      <Reveal>
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
              Last updated {profile.lastUpdated}
            </p>
          </div>
          <Button size="lg" className="gap-1.5">
            <Pencil className="size-4" aria-hidden="true" />
            Edit Profile
          </Button>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <WidgetCard title="Profile" icon={UserRound} className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div
              className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold tracking-tight text-foreground"
              aria-label={`Avatar for ${profile.fullName}`}
            >
              {profile.initials}
            </div>
            <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              {profile.fullName}
            </p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          <dl className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Target className="size-4 shrink-0" aria-hidden="true" />
                Target Career
              </dt>
              <dd className="font-medium text-foreground">
                {profile.targetCareer}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                Location
              </dt>
              <dd className="font-medium text-foreground">
                {profile.location}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                Member Since
              </dt>
              <dd className="font-medium text-foreground">
                {profile.memberSince}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <ProgressBar
              value={profile.profileCompletion}
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
            {careerSummary.map((item) => (
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

        <WidgetCard title="Career Statistics" icon={Gauge}>
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

        <WidgetCard title="Skills Overview" icon={Code}>
          <p className="mb-3 text-xs text-muted-foreground">Top Skills</p>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill) => (
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
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
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

      <WidgetCard title="Quick Actions" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
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
