import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { cn } from '@/lib/utils'

const MAX_SIZE = 10 * 1024 * 1024
const ACCEPT_ATTR =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

interface SelectedFile {
  file: File
  progress: number
  status: 'uploading' | 'success'
}

export interface ResumeDropzoneHandle {
  open: () => void
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  const isDocx =
    file.type.includes('wordprocessingml') || name.endsWith('.docx')
  if (!isPdf && !isDocx) return 'Only PDF or DOCX files are supported.'
  if (file.size > MAX_SIZE) return 'File is larger than the 10 MB limit.'
  return null
}

interface FilePreviewCardProps {
  name: string
  size: string
  progress: number
  status: SelectedFile['status']
  onRemove: () => void
  onReplace: () => void
}

function FilePreviewCard({
  name,
  size,
  progress,
  status,
  onRemove,
  onReplace,
}: FilePreviewCardProps) {
  const isSuccess = status === 'success'
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <FileText className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <span className="shrink-0 text-xs text-muted-foreground">{size}</span>
        </div>
        {isSuccess ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
            Upload complete
          </p>
        ) : (
          <>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Uploading… {progress}%
            </p>
            <ProgressBar value={progress} className="mt-2" />
          </>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReplace}
          className="gap-1.5"
        >
          <UploadCloud className="size-4" aria-hidden="true" />
          Replace
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="gap-1.5"
        >
          <X className="size-4" aria-hidden="true" />
          Remove
        </Button>
      </div>
    </div>
  )
}

interface ResumeDropzoneProps {
  onUploaded?: (name: string) => void
}

export const ResumeDropzone = forwardRef<
  ResumeDropzoneHandle,
  ResumeDropzoneProps
>(function ResumeDropzone({ onUploaded }, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<SelectedFile | null>(null)

  useImperativeHandle(ref, () => ({ open: () => inputRef.current?.click() }))

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function startUpload(file: File) {
    clearTimer()
    setError(null)
    setSelected({ file, progress: 0, status: 'uploading' })
    let p = 0
    timerRef.current = setInterval(() => {
      p += Math.random() * 16 + 8
      if (p >= 100) {
        clearTimer()
        setSelected((s) => (s ? { ...s, progress: 100, status: 'success' } : s))
        onUploaded?.(file.name)
      } else {
        setSelected((s) => (s ? { ...s, progress: Math.round(p) } : s))
      }
    }, 350)
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    startUpload(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleRemove() {
    clearTimer()
    setSelected(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleReplace() {
    clearTimer()
    setSelected(null)
    inputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {selected ? (
        <FilePreviewCard
          name={selected.file.name}
          size={formatBytes(selected.file.size)}
          progress={selected.progress}
          status={selected.status}
          onRemove={handleRemove}
          onReplace={handleReplace}
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resume. Drag and drop a file here, or press Enter to browse."
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragActive(false)
          }}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-foreground/30 hover:bg-muted/40',
          )}
        >
          <span
            className={cn(
              'mb-4 flex size-14 items-center justify-center rounded-2xl transition-colors',
              dragActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <UploadCloud className="size-7" aria-hidden="true" />
          </span>
          <p className="text-base font-medium text-foreground">
            Drag &amp; drop your resume here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or{' '}
            <span className="font-medium text-primary underline-offset-4 hover:underline">
              browse
            </span>{' '}
            to choose a file
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            PDF or DOCX · Max 10 MB
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
})
