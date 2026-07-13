import type { User } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
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
// Small helpers. The backend returns a confidence per skill GROUP (category),
// which the AI computes independently for each category. Per-skill displays
// reuse their own category's score rather than a single shared number, so each
// category shows its real confidence and the aggregate is derived from them.
// ---------------------------------------------------------------------------

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

function toDateObj(ts?: Timestamp | string | Date): Date | null {
  if (!ts) return null
  if (ts instanceof Date) return ts
  if (typeof ts === 'string') return new Date(ts)
  // Firebase Timestamp — always exposes toDate().
  if (typeof ts.toDate === 'function') return ts.toDate()
  return null
}

function formatDate(ts?: Timestamp | string): string {
  const d = toDateObj(ts)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function relativeTime(ts?: Timestamp | string): string {
  const d = toDateObj(ts)
  if (!d) return 'Recently'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return 'Today'
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  return `${Math.floor(months / 12)} yr ago`
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

function getTechnical(
  analysis: SkillAnalysisDoc | null,
  aggregateConfidence?: number,
): TechnicalSkill[] {
  const groups = analysis?.technicalSkills ?? []
  const out: TechnicalSkill[] = []
  for (const g of groups) {
    // Per-category confidence from the AI. Fall back to the aggregate only
    // when a group has no score (e.g. older analysis docs).
    const catConf = g.confidence ?? aggregateConfidence ?? 0
    for (const s of g.skills) {
      out.push({
        name: s,
        category: g.category,
        confidence: catConf,
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

function buildResume(slots: DataSlots, displayName: string): ResumeState {
  const active = slots.resumes.filter((r) => r.status !== 'deleted')
  const count = active.length
  // Never surface the raw uploaded filename — show a friendly label built
  // from the user's display name instead.
  const labelFor = (i: number) =>
    count > 1 ? `${displayName} Resume ${i + 1}` : `${displayName} Resume`
  const recent: ResumeEntryData[] = active.map((r, i) => {
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
      name: labelFor(i),
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
    fileName: current ? labelFor(0) : 'No resume yet',
    uploaded: current ? relativeTime(current.uploadedAt) : '—',
    recent,
  }
}

function buildSkills(slots: DataSlots): SkillsData {
  const analysis = slots.analysis
  // Real aggregate confidence from the AI pipeline (0 when absent).
  const skillConfidence = Math.round(analysis?.confidence?.skills ?? 0)
  const overallConfidence = Math.round(analysis?.confidence?.overall ?? 0)
  const careerMatchConfidence = Math.round(
    analysis?.confidence?.careerMatch ?? 0,
  )
  const technical = getTechnical(analysis, skillConfidence)
  const categories = getCategories(analysis)
  const softSkills = (analysis?.softSkills ?? []).map((name) => ({
    name,
    confidence: skillConfidence,
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
      skillConfidence: 0,
      overallConfidence: 0,
      careerMatchConfidence: 0,
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
    skillConfidence,
    overallConfidence,
    careerMatchConfidence,
    insights: [
      `You have ${total} technical skills across ${categories.length} ${
        categories.length === 1 ? 'area' : 'areas'
      }.`,
      `Overall AI confidence: ${overallConfidence}%.`,
      `Career-match confidence: ${careerMatchConfidence}%.`,
      softSkills.length
        ? `Plus ${softSkills.length} soft skill${softSkills.length > 1 ? 's' : ''} identified.`
        : '',
    ].filter(Boolean),
    action: {
      strength: strongest.name,
      weakness: weakest.name,
      nextSkill,
      improvement: nextSkill,
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
    match: Math.round(c.confidence * 100),
    description: c.reason,
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
      value: careers[0] ? `${Math.round(careers[0].confidence * 100)}%` : '—',
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
    ? `Top match: ${careers[0].careerName} at ${Math.round(careers[0].confidence * 100)}%.`
    : 'No career matches yet — upload a resume to get started.'

  return { careers: mapped, insights, insightNote }
}

function buildSkillGap(slots: DataSlots): SkillGapData {
  const analysis = slots.analysis
  const skillConfidence = Math.round(analysis?.confidence?.skills ?? 0)
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

  const technical = getTechnical(analysis, skillConfidence)
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
    difficulty: mapGapDifficulty(it.difficulty),
    confidence: skillConfidence,
  }))

  const recommendations = missing.length
    ? missing
        .slice(0, 4)
        .map(
          (it, i) =>
            `Priority ${i + 1}: close the “${it.skill}” gap (${it.priority} priority).`,
        )
    : ['Upload a resume to get prioritized skill-gap recommendations.']

  return {
    detected,
    missing: missingGroups,
    coverage,
    priority,
    recommendations,
    skillConfidence,
  }
}

function buildRoadmap(slots: DataSlots): RoadmapData {
  const phases = slots.roadmap?.phases ?? []
  const mapped = phases.map((p) => ({
    title: p.title,
    // The backend never records a user's completion of a phase, so `locked`
    // phases are relabelled `upcoming` (not "locked") and `completed` only
    // appears if the backend genuinely marks it done. No fabricated progress.
    status: (p.completionStatus === 'in_progress'
      ? 'current'
      : p.completionStatus === 'completed'
        ? 'completed'
        : 'upcoming') as RoadmapData['modules'][number]['status'],
    description: p.description,
    difficulty: mapPriorityToDifficulty(p.priority),
    estimatedHours: p.estimatedHours,
    skills: p.requiredSkills ?? [],
    // No per-phase progress is tracked yet, so `progress` stays undefined and
    // the UI shows status-only (no fabricated percentage).
    progress: undefined,
  }))

  return { modules: mapped }
}

function buildCourses(slots: DataSlots): CoursesData {
  const courseDoc = slots.courses
  const list = courseDoc?.courses ?? []
  const gapSkills = new Set(
    (slots.skillGap?.missingSkills ?? []).map((s) => s.skill),
  )
  const targetCareer = slots.profile?.targetCareer ?? null

  const courses = list.map((c, i) => {
    const coversMissing = gapSkills.has(c.skill)
    const reason = coversMissing
      ? `Recommended because your resume lacks ${c.skill}, a gap for ${targetCareer ?? 'your target role'}.`
      : `Builds ${c.skill}, which supports your path to ${targetCareer ?? 'your target role'}.`
    return {
      id: slug(c.title) || `course-${i}`,
      title: c.title,
      platform: c.provider,
      difficulty: mapCourseDifficulty(c.difficulty),
      duration: c.estimatedDuration,
      skills: [c.skill],
      reason,
      url: c.url || '',
    }
  })

  // Real, derived summary stats — no fabricated metrics.
  const platforms = [...new Set(courses.map((c) => c.platform))].sort()
  const missingCovered = courses.filter((c) =>
    gapSkills.has(c.skills[0]),
  ).length
  const free = courses.filter((c) =>
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i.test(c.url),
  ).length

  const summary = {
    total: courses.length,
    free,
    paid: courses.length - free,
    platforms,
    missingSkillsCovered: missingCovered,
    targetCareer,
  }

  return { courses, summary }
}

function buildDashboard(slots: DataSlots): DashboardSummary {
  const dash = slots.dashboard
  const missing = slots.skillGap?.missingSkills ?? []
  const phases = slots.roadmap?.phases ?? []
  const completed = phases.filter(
    (p) => p.completionStatus === 'completed',
  ).length
  const recommendedNext = dash?.recommendedCourse || missing[0]?.skill || '—'

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

  // Dynamic profile completion — one equal share per present, real field.
  // (A bio field exists in the update payload but is not returned by the
  // profile read endpoint, so it is intentionally excluded from the count.)
  const COMPLETION_FIELDS = 7
  let completionFilled = 0
  if (fullName && fullName !== 'New User') completionFilled++
  if (authUser.photoURL) completionFilled++
  if (profile?.phone && profile.phone.trim()) completionFilled++
  if (profile?.location && profile.location !== 'Not set') completionFilled++
  if (resumeCount > 0) completionFilled++
  if (profile?.targetCareer && profile.targetCareer !== 'Not set')
    completionFilled++
  if (technicalCount > 0) completionFilled++
  const profileCompletion = Math.round(
    (completionFilled / COMPLETION_FIELDS) * 100,
  )

  const userProfile: UserProfile = {
    fullName,
    initials: initials(fullName),
    email,
    targetCareer: profile?.targetCareer || 'Not set',
    location: profile?.location || 'Not set',
    phone: profile?.phone || '',
    memberSince: formatDate(profile?.createdAt),
    profileCompletion,
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
        ? `${Math.round(slots.careerMatches.careers[0].confidence * 100)}% match`
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
    resume: buildResume(slots, authUser.displayName),
    skills: buildSkills(slots),
    careerMatches: buildCareerMatches(slots),
    skillGap: buildSkillGap(slots),
    roadmap: buildRoadmap(slots),
    courses: buildCourses(slots),
    dashboardSummary: buildDashboard(slots),
  }
}
