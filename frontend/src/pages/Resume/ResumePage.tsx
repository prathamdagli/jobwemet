import { useRef, useState } from 'react'
import { History, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import {
  RecentResumes,
  type ResumeEntry,
} from '@/components/resume/RecentResumes'
import {
  ResumeDropzone,
  type ResumeDropzoneHandle,
} from '@/components/resume/ResumeDropzone'

const PLACEHOLDER_RESUMES: ResumeEntry[] = [
  { id: 'r1', name: 'Resume_v1.pdf', uploaded: 'Today' },
  { id: 'r2', name: 'Resume_AI.pdf', uploaded: '2 days ago' },
  { id: 'r3', name: 'Frontend_Resume.pdf', uploaded: 'Last week' },
]

export default function ResumePage() {
  const dropRef = useRef<ResumeDropzoneHandle>(null)
  const [recent, setRecent] = useState<ResumeEntry[]>(PLACEHOLDER_RESUMES)

  function handleUploaded(name: string) {
    setRecent((prev) => [
      { id: `u-${Date.now()}`, name, uploaded: 'Just now' },
      ...prev,
    ])
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Resume
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your resume to unlock AI-powered skill extraction and career
            matching.
          </p>
        </div>
        <Button
          onClick={() => dropRef.current?.open()}
          size="lg"
          className="gap-1.5"
        >
          <UploadCloud className="size-4" aria-hidden="true" />
          Upload Resume
        </Button>
      </header>

      <ResumeDropzone ref={dropRef} onUploaded={handleUploaded} />

      <WidgetCard title="Recently Uploaded Resumes" icon={History}>
        <RecentResumes items={recent} />
      </WidgetCard>
    </div>
  )
}
