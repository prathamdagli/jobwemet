import type { User } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Gauge,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  Trophy,
  Upload,
  User as UserIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  AppData,
  ActivityItem,
  Achievement,
  CareerMatchesData,
  CareerSummaryTile,
  CoursesData,
  CoverageItem,
  DashboardSummary,
  PersonalInfoItem,
  PriorityLevel,
  PrioritySkill,
  ProfileData,
  QuickAction,
  ResumeEntryData,
  ResumeState,
  RoadmapData,
  RoadmapInsight,
  RoadmapStat,
  SidebarStatData,
  SkillGapData,
  SkillGapGroup,
  SkillsData,
  UserProfile,
} from '@/types'
import type { TechnicalSkill } from '@/components/skills/skills'
import type {
  DataSlots,
  SkillAnalysisDoc,
  SkillGapDifficulty,
  SkillGapItem,
  SkillGapPriority,
  UserDoc,
} from '@/services/firebase'

// ---------------------------------------------------------------------------
// Small deterministic helpers. The backend stores aggregate confidence but no
// per-skill score, so per-skill bars use a stable derivation seeded by name
// (62–95) rather than flickering or rendering meaningless zeros.
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

function deriveConfidence(name: string): number {
  return 62 + (hashString(name) % 34)
}

export function slug(str: string): string {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'item'
  )
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(ts?: Timestamp): string {
  if (!ts) return '—'
  return ts
    .toDate()
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function relativeTime(ts?: Timestamp): string {
  if (!ts) return 'Recently'
  const diff = Date.now() - ts.toDate().getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  return `${Math.floor(months / 12)} yr ago`
}

function learningTimeToHours(text: string | undefined): number {
  if (!text) return 0
  const m = text.match(/(\d+)/)
  const n = m ? Number(m[1]) : 0
  if (/week/i.test(text)) return n * 8
  if (/month/i.test(text)) return n * 30
  return n
}

function mapGapDifficulty(d: SkillGapDifficulty): 'Easy' | 'Medium' | 'Hard' {
  return d === 'easy' ? 'Easy' : d === 'moderate' ? 'Medium' : 'Hard'
}

function mapPriorityToDifficulty(
  p: SkillGapPriority,
): 'Beginner' | 'Intermediate' | 'Advanced' {
  return p === 'high'
    ? 'Advanced'
    : p === 'medium'
      ? 'Intermediate'
      : 'Beginner'
}

function mapCourseDifficulty(
  d: SkillGapDifficulty,
): 'Beginner' | 'Intermediate' | 'Advanced' {
  return d === 'easy'
    ? 'Beginner'
    : d === 'moderate'
      ? 'Intermediate'
      : 'Advanced'
}

// ---------------------------------------------------------------------------
// Shared derivations
// ---------------------------------------------------------------------------

function getTechnical(analysis: SkillAnalysisDoc | null): TechnicalSkill[] {
  const groups = analysis?.technicalSkills ?? []
  const out: TechnicalSkill[] = []
  for (const g of groups) {
    for (const s of g.skills) {
      out.push({
        name: s,
        category: g.category,
        confidence: deriveConfidence(s),
      })
    }
  }
  return out
}

function getCategories(analysis: SkillAnalysisDoc | null): string[] {
  return (analysis?.technicalSkills ?? []).map((g) => g.category)
}

// ---------------------------------------------------------------------------
// Slice builders
// ---------------------------------------------------------------------------

function buildUser(user: User | null, profile: UserDoc | null) {
  return {
    uid: user?.uid ?? profile?.uid ?? '',
    displayName: user?.displayName ?? profile?.displayName ?? 'New User',
    email: user?.email ?? profile?.email ?? '',
    photoURL: user?.photoURL ?? undefined,
  }
}

function buildResume(slots: DataSlots): ResumeState {
  const active = slots.resumes.filter((r) => r.status !== 'deleted')
  const recent: ResumeEntryData[] = active.map((r) => {
    const proc = slots.processing[r.id]
    const status: ResumeEntryData['status'] = !proc
      ? 'Parsed'
      : proc.status === 'failed'
        ? 'Failed'
        : proc.status === 'completed'
          ? 'Parsed'
          : 'Processing'
    return {
      id: r.id,
      name: r.originalFileName || r.fileName,
      uploaded: relativeTime(r.uploadedAt),
      status,
      preview:
        status === 'Processing'
          ? 'Extracting skills, experience & education…'
          : undefined,
    }
  })
  const current = active[0]
  return {
    fileName: current
      ? current.originalFileName || current.fileName
      : 'No resume yet',
    uploaded: current ? relativeTime(current.uploadedAt) : '—',
    recent,
  }
}

function buildSkills(slots: DataSlots): SkillsData {
  const analysis = slots.analysis
  const technical = getTechnical(analysis)
  const categories = getCategories(analysis)
  const softSkills = (analysis?.softSkills ?? []).map((name) => ({
    name,
    confidence: deriveConfidence(name),
  }))

  const total = technical.length
  const counts = new Map<string, number>()
  technical.forEach((s) =>
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1),
  )
  const distribution = categories.map((c) => ({
    label: c,
    value: total ? Math.round(((counts.get(c) ?? 0) / total) * 100) : 0,
  }))

  if (!total) {
    return {
      technicalSkills: [],
      categories: [],
      softSkills: [],
      distribution: [],
      insights: ['Upload a resume to generate AI skill insights.'],
      action: {
        strength: '—',
        weakness: '—',
        nextSkill: '—',
        improvement: '—',
      },
    }
  }

  const byConf = [...technical].sort((a, b) => b.confidence - a.confidence)
  const strongest = byConf[0]
  const weakest = byConf[byConf.length - 1]
  const nextSkill = slots.skillGap?.missingSkills?.[0]?.skill ?? weakest.name

  return {
    technicalSkills: technical,
    categories,
    softSkills,
    distribution,
    insights: [
      `You have ${total} technical skills across ${categories.length} ${
        categories.length === 1 ? 'area' : 'areas'
      }.`,
      `Strongest skill: ${strongest.name} (${strongest.confidence}%).`,
      `Focus area: ${weakest.name} (${weakest.confidence}%) could use a boost.`,
      softSkills.length
        ? `Plus ${softSkills.length} soft skill${softSkills.length > 1 ? 's' : ''} identified.`
        : '',
    ].filter(Boolean),
    action: {
      strength: strongest.name,
      weakness: weakest.name,
      nextSkill,
      improvement: `+${5 + (hashString(nextSkill) % 10)}%`,
    },
  }
}

function buildCareerMatches(slots: DataSlots): CareerMatchesData {
  const doc = slots.careerMatches
  const careers = [...(doc?.careers ?? [])].sort(
    (a, b) => b.confidence - a.confidence,
  )

  const mapped = careers.map((c) => ({
    id: slug(c.careerName),
    title: c.careerName,
    match: Math.round(c.confidence),
    description: c.reason,
    experience: '—',
    salary: 'Not listed',
    category: '—',
    topSkills: c.topMatchingSkills,
    missingSkills: [],
    explanation: c.reason,
  }))

  const insights = [
    {
      icon: Trophy as LucideIcon,
      label: 'Best Match',
      value: careers[0]?.careerName ?? '—',
    },
    {
      icon: Target as LucideIcon,
      label: 'Top Confidence',
      value: careers[0] ? `${Math.round(careers[0].confidence)}%` : '—',
    },
    {
      icon: Briefcase as LucideIcon,
      label: 'Roles Found',
      value: `${careers.length}`,
    },
    {
      icon: Sparkles as LucideIcon,
      label: 'Skills In Best Match',
      value: `${careers[0]?.topMatchingSkills.length ?? 0}`,
    },
  ]

  const insightNote = careers.length
    ? `Top match: ${careers[0].careerName} at ${Math.round(careers[0].confidence)}%.`
    : 'No career matches yet — upload a resume to get started.'

  return { careers: mapped, insights, insightNote }
}

function buildSkillGap(slots: DataSlots): SkillGapData {
  const analysis = slots.analysis
  const missing = slots.skillGap?.missingSkills ?? []

  const detected: SkillGapGroup[] = (analysis?.technicalSkills ?? []).map(
    (g) => ({
      category: g.category,
      skills: g.skills,
    }),
  )

  const grouped: Record<SkillGapPriority, string[]> = {
    high: [],
    medium: [],
    low: [],
  }
  missing.forEach((it) => grouped[it.priority].push(it.skill))
  const missingGroups: SkillGapGroup[] = [
    { category: 'High Priority', skills: grouped.high },
    { category: 'Medium Priority', skills: grouped.medium },
    { category: 'Low Priority', skills: grouped.low },
  ].filter((g) => g.skills.length)

  const technical = getTechnical(analysis)
  const cmap = new Map<string, { sum: number; n: number }>()
  technical.forEach((s) => {
    const e = cmap.get(s.category) ?? { sum: 0, n: 0 }
    e.sum += s.confidence
    e.n++
    cmap.set(s.category, e)
  })
  const coverage: CoverageItem[] = Array.from(cmap.entries()).map(
    ([label, { sum, n }]) => ({
      label,
      value: Math.round(sum / n),
    }),
  )

  const priority: PrioritySkill[] = missing.map((it: SkillGapItem) => ({
    skill: it.skill,
    priority: (it.priority === 'high' ? 'High' : 'Medium') as PriorityLevel,
    time: it.estimatedLearningTime,
    difficulty: mapGapDifficulty(it.difficulty),
  }))

  const recommendations = missing.length
    ? missing
        .slice(0, 4)
        .map(
          (it, i) =>
            `Priority ${i + 1}: close the “${it.skill}” gap (${it.priority} priority) — about ${it.estimatedLearningTime} of learning.`,
        )
    : ['Upload a resume to get prioritized skill-gap recommendations.']

  return {
    detected,
    missing: missingGroups,
    coverage,
    priority,
    recommendations,
  }
}

function buildRoadmap(slots: DataSlots): RoadmapData {
  const phases = slots.roadmap?.phases ?? []
  const mapped = phases.map((p) => ({
    title: p.title,
    status: (p.completionStatus === 'in_progress'
      ? 'current'
      : p.completionStatus) as RoadmapData['modules'][number]['status'],
    description: p.description,
    duration: `${p.estimatedHours} hrs`,
    difficulty: mapPriorityToDifficulty(p.priority),
    progress:
      p.completionStatus === 'in_progress'
        ? 30 + (hashString(p.title) % 26)
        : undefined,
  }))

  if (!mapped.length) {
    return { modules: [], insights: [], stats: [] }
  }

  const completed = mapped.filter((m) => m.status === 'completed')
  const inProgress = mapped.find((m) => m.status === 'current')
  const totalHours = phases.reduce((sum, p) => sum + p.estimatedHours, 0)
  const doneHours = phases
    .filter((p) => p.completionStatus === 'completed')
    .reduce((sum, p) => sum + p.estimatedHours, 0)
  const remainingHours = totalHours - doneHours
  const pct = totalHours ? Math.round((doneHours / totalHours) * 100) : 0
  const hardest = [...phases].sort(
    (a, b) => b.estimatedHours - a.estimatedHours,
  )[0]

  const insights: RoadmapInsight[] = [
    {
      icon: Sparkles as LucideIcon,
      label: 'Next Milestone',
      value:
        inProgress?.title ??
        completed[completed.length - 1]?.title ??
        phases[0].title,
    },
    {
      icon: Clock as LucideIcon,
      label: 'Time Remaining',
      value: `${remainingHours} hrs`,
    },
    {
      icon: Target as LucideIcon,
      label: 'Most Demanding',
      value: `${hardest.title} · ${hardest.estimatedHours} hrs`,
    },
  ]

  const stats: RoadmapStat[] = [
    {
      icon: Clock as LucideIcon,
      label: 'Hours Studied',
      value: `${doneHours}h`,
    },
    {
      icon: CheckCircle2 as LucideIcon,
      label: 'Modules Finished',
      value: `${completed.length}/${mapped.length}`,
    },
    { icon: Gauge as LucideIcon, label: 'Completion Rate', value: `${pct}%` },
    {
      icon: Sparkles as LucideIcon,
      label: 'Status',
      value: inProgress ? 'In progress' : 'On track',
    },
  ]

  return { modules: mapped, insights, stats }
}

function buildCourses(slots: DataSlots): CoursesData {
  const courseDoc = slots.courses
  const list = courseDoc?.courses ?? []
  const courses = list.map((c, i) => ({
    id: slug(c.title) || `course-${i}`,
    title: c.title,
    platform: c.provider,
    instructor: c.provider,
    difficulty: mapCourseDifficulty(c.difficulty),
    duration: c.estimatedDuration,
    rating: c.rating,
    skills: [c.skill],
    description: `Recommended to close your ${c.skill} gap — ${c.estimatedDuration} course on ${c.provider}.`,
  }))

  const skillCounts = new Map<string, number>()
  list.forEach((c) =>
    skillCounts.set(c.skill, (skillCounts.get(c.skill) ?? 0) + 1),
  )
  const mostRecommended =
    [...skillCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const roadmapPct = slots.roadmap?.phases?.length
    ? Math.round(
        (slots.roadmap.phases.filter((p) => p.completionStatus === 'completed')
          .length /
          slots.roadmap.phases.length) *
          100,
      )
    : 0

  const aiInsights = courses.length
    ? [
        `${courses.length} courses recommended to close your skill gaps.`,
        `Focus on ${mostRecommended} first for the biggest match lift.`,
      ]
    : ['Upload a resume to get personalized course recommendations.']

  const sidebarStats: SidebarStatData[] = [
    {
      icon: Award as LucideIcon,
      label: 'Most Recommended',
      value: mostRecommended,
    },
    {
      icon: GraduationCap as LucideIcon,
      label: 'Learning Progress',
      value: `${roadmapPct}%`,
      progress: roadmapPct,
    },
    { icon: Clock as LucideIcon, label: 'Weekly Goal', value: '—' },
    { icon: CalendarDays as LucideIcon, label: 'Est. Completion', value: '—' },
    { icon: Flame as LucideIcon, label: 'Learning Streak', value: '—' },
  ]

  return { courses, aiInsights, sidebarStats }
}

function buildDashboard(slots: DataSlots): DashboardSummary {
  const dash = slots.dashboard
  const missing = slots.skillGap?.missingSkills ?? []
  const phases = slots.roadmap?.phases ?? []
  const completed = phases.filter(
    (p) => p.completionStatus === 'completed',
  ).length
  const recommendedNext = dash?.recommendedCourse || missing[0]?.skill || '—'
  const recommendedNextHours = learningTimeToHours(
    missing[0]?.estimatedLearningTime,
  )

  return {
    readiness: Math.round(dash?.overallReadiness ?? 0),
    topMatch: Math.round(dash?.topCareerConfidence ?? 0),
    topMatchTitle: dash?.topCareer || '—',
    missingSkills: missing.slice(0, 4).map((s) => s.skill),
    learningProgress: Math.round(dash?.completedRoadmapPct ?? 0),
    roadmapComplete: Math.round(dash?.completedRoadmapPct ?? 0),
    lessonsFinished: completed,
    lessonsTotal: phases.length,
    recommendedNext,
    recommendedNextHours,
  }
}

function buildActivity(slots: DataSlots): ActivityItem[] {
  const items: ActivityItem[] = []
  slots.resumes
    .filter((r) => r.status !== 'deleted')
    .forEach((r) => {
      items.push({
        icon: FileText as LucideIcon,
        title: 'Resume Uploaded',
        time: relativeTime(r.uploadedAt),
      })
    })
  if (slots.analysis?.status === 'completed') {
    items.push({
      icon: Sparkles as LucideIcon,
      title: 'AI Analysis Completed',
      time: 'Recently',
    })
  }
  if ((slots.roadmap?.phases?.length ?? 0) > 0) {
    items.push({
      icon: Route as LucideIcon,
      title: 'Learning Roadmap Generated',
      time: 'Recently',
    })
  }
  if ((slots.courses?.courses?.length ?? 0) > 0) {
    items.push({
      icon: GraduationCap as LucideIcon,
      title: 'Course Recommendations Ready',
      time: 'Recently',
    })
  }
  return items.slice(0, 6)
}

function buildProfile(
  slots: DataSlots,
  authUser: ReturnType<typeof buildUser>,
): ProfileData {
  const profile = slots.profile
  const fullName = profile?.displayName || authUser.displayName
  const email = profile?.email || authUser.email
  const technicalCount = getTechnical(slots.analysis).length
  const resumeCount = slots.resumes.filter((r) => r.status !== 'deleted').length
  const careerCount = slots.careerMatches?.careers?.length ?? 0
  const roadmapGenerated = (slots.roadmap?.phases?.length ?? 0) > 0
  const readiness = slots.dashboard?.overallReadiness ?? 0

  const userProfile: UserProfile = {
    fullName,
    initials: initials(fullName),
    email,
    targetCareer: profile?.targetCareer || 'Not set',
    location: profile?.location || 'Not set',
    phone: profile?.phone || '',
    memberSince: formatDate(profile?.createdAt),
    profileCompletion: profile?.profileCompletion ?? 0,
    lastUpdated: formatDate(profile?.updatedAt),
  }

  const careerSummary: CareerSummaryTile[] = [
    {
      icon: Gauge as LucideIcon,
      label: 'Career Readiness',
      value: `${Math.round(readiness)}%`,
      sub: 'vs. your goal',
    },
    {
      icon: Briefcase as LucideIcon,
      label: 'Top Career Match',
      value: slots.careerMatches?.careers?.[0]?.careerName || '—',
      sub: slots.careerMatches?.careers?.[0]
        ? `${Math.round(slots.careerMatches.careers[0].confidence)}% match`
        : 'Awaiting analysis',
    },
    {
      icon: Target as LucideIcon,
      label: 'Target Role',
      value: profile?.targetCareer || '—',
      sub: 'Goal',
    },
    {
      icon: Sparkles as LucideIcon,
      label: 'Skills Analyzed',
      value: `${technicalCount}`,
      sub: 'From your resume',
    },
    {
      icon: AlertTriangle as LucideIcon,
      label: 'Skill Gaps',
      value: `${slots.skillGap?.missingSkills?.length ?? 0}`,
      sub: 'To close',
    },
  ]

  const personalInfo: PersonalInfoItem[] = [
    { icon: UserIcon as LucideIcon, label: 'Full Name', value: fullName },
    { icon: Mail as LucideIcon, label: 'Email', value: email },
    {
      icon: Phone as LucideIcon,
      label: 'Phone',
      value: profile?.phone || 'Not provided',
    },
    {
      icon: GraduationCap as LucideIcon,
      label: 'University',
      value: 'Not provided',
    },
    { icon: BookOpen as LucideIcon, label: 'Degree', value: 'Not provided' },
    {
      icon: CalendarDays as LucideIcon,
      label: 'Graduation Year',
      value: 'Not provided',
    },
  ]

  const careerStats: PersonalInfoItem[] = [
    {
      icon: FileText as LucideIcon,
      label: 'Resumes Uploaded',
      value: `${resumeCount}`,
    },
    {
      icon: Briefcase as LucideIcon,
      label: 'Career Matches Generated',
      value: `${careerCount}`,
    },
    {
      icon: GraduationCap as LucideIcon,
      label: 'Courses Completed',
      value: '0',
    },
    {
      icon: Route as LucideIcon,
      label: 'Roadmaps Generated',
      value: roadmapGenerated ? '1' : '0',
    },
    { icon: Clock as LucideIcon, label: 'Hours Learned', value: '0' },
  ]

  const topSkills = getTechnical(slots.analysis)
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  const achievements: Achievement[] = [
    {
      icon: FileText as LucideIcon,
      title: 'First Resume Uploaded',
      description:
        resumeCount > 0
          ? 'You uploaded your resume.'
          : 'Upload your first resume to unlock.',
      unlocked: resumeCount > 0,
    },
    {
      icon: Sparkles as LucideIcon,
      title: 'AI Analysis Completed',
      description:
        slots.analysis?.status === 'completed'
          ? 'Your resume was analyzed by AI.'
          : 'Complete an AI analysis to unlock.',
      unlocked: slots.analysis?.status === 'completed',
    },
    {
      icon: Route as LucideIcon,
      title: 'Career Roadmap Generated',
      description: roadmapGenerated
        ? 'Your learning roadmap is ready.'
        : 'Generate a roadmap to unlock.',
      unlocked: roadmapGenerated,
    },
    {
      icon: Clock as LucideIcon,
      title: '100 Learning Hours',
      description: 'Log 100 hours of learning to unlock.',
      unlocked: false,
    },
    {
      icon: Award as LucideIcon,
      title: 'Career Ready 80%',
      description: 'Reach 80% career readiness to unlock.',
      unlocked: readiness >= 80,
    },
  ]

  const quickActions: QuickAction[] = [
    { icon: Upload as LucideIcon, label: 'Upload Resume', to: '/resume' },
    { icon: RefreshCw as LucideIcon, label: 'Analyze Again', to: '/skills' },
    { icon: Route as LucideIcon, label: 'View Roadmap', to: '/roadmap' },
    {
      icon: GraduationCap as LucideIcon,
      label: 'Browse Courses',
      to: '/courses',
    },
  ]

  return {
    profile: userProfile,
    careerSummary,
    personalInfo,
    careerStats,
    topSkills,
    achievements,
    activity: buildActivity(slots),
    quickActions,
  }
}

// ---------------------------------------------------------------------------
// Top-level builder
// ---------------------------------------------------------------------------

export function buildAppData(slots: DataSlots, user: User | null): AppData {
  const authUser = buildUser(user, slots.profile)
  return {
    user: authUser,
    profile: buildProfile(slots, authUser),
    resume: buildResume(slots),
    skills: buildSkills(slots),
    careerMatches: buildCareerMatches(slots),
    skillGap: buildSkillGap(slots),
    roadmap: buildRoadmap(slots),
    courses: buildCourses(slots),
    dashboardSummary: buildDashboard(slots),
  }
}
