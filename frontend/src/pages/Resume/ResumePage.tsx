import { useRef } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  History,
  Loader2,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { Stagger } from '@/motion'
import { useResume } from '@/hooks/useResume'
import { RecentResumes } from '@/components/resume/RecentResumes'
import {
  ResumeDropzone,
  type ResumeDropzoneHandle,
} from '@/components/resume/ResumeDropzone'

export default function ResumePage() {
  const dropRef = useRef<ResumeDropzoneHandle>(null)
  const resume = useResume()
  const recent = resume.recent

  const parsedCount = recent.filter(
    (r) => (r.status ?? 'Parsed') === 'Parsed',
  ).length
  const processingCount = recent.filter((r) => r.status === 'Processing').length
  const failedCount = recent.filter((r) => r.status === 'Failed').length

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Resume"
        title="Resume Library"
        description="Upload your resume and our AI extracts your skills, experience, and education — then matches you to careers in seconds."
        action={
          <Button
            onClick={() => dropRef.current?.open()}
            size="sm"
            className="gap-1.5"
          >
            <UploadCloud className="size-4" aria-hidden="true" />
            Upload Resume
          </Button>
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            AI extraction
          </span>
        }
      />

      {/* Dominant upload zone + supporting insight panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ResumeDropzone ref={dropRef} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCard
            variant="feature"
            padding="lg"
            title="Library at a glance"
            icon={History}
            className="h-full"
          >
            <div className="space-y-4">
              <Stagger className="grid grid-cols-2 gap-4">
                <MetricCard
                  variant="sm"
                  label="Resumes"
                  value={String(recent.length)}
                  icon={FileText}
                />
                <MetricCard
                  variant="sm"
                  label="Parsed"
                  value={String(parsedCount)}
                  icon={CheckCircle2}
                />
              </Stagger>
              <div className="flex flex-wrap gap-2">
                <Badge variant="soft" size="xs" className="gap-1">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {parsedCount} parsed
                </Badge>
                <Badge variant="muted" size="xs" className="gap-1">
                  <Loader2 className="size-3.5" aria-hidden="true" />
                  {processingCount} parsing
                </Badge>
                {failedCount > 0 && (
                  <Badge variant="outline" size="xs" className="gap-1">
                    <AlertTriangle className="size-3.5" aria-hidden="true" />
                    {failedCount} failed
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your latest parsed version is used automatically for career
                matching and skill gap analysis.
              </p>
            </div>
          </WidgetCard>
        </div>
      </div>

      {/* Recent uploads */}
      <WidgetCard
        title="Recent uploads"
        icon={History}
        padding="lg"
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => dropRef.current?.open()}
          >
            <UploadCloud className="size-4" aria-hidden="true" />
            Add resume
          </Button>
        }
      >
        <RecentResumes
          items={recent}
          onUpload={() => dropRef.current?.open()}
        />
      </WidgetCard>
    </div>
  )
}
