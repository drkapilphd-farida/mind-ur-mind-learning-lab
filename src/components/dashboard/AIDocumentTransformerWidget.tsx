'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, RotateCcw, Sparkles, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UploadZone } from '@/components/learning/UploadZone'
import { UploadProgress, type UploadProgressStatus } from '@/components/learning/UploadProgress'
import { formatFileSize } from '@/lib/formatFileSize'
import { formatRelativeDate } from '@/lib/formatRelativeDate'
import { universalUploadParser } from '@/core/universal-learning-engine/upload'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { QuantumDocument } from '@/features/quantum-document-transformer/types'
import { getLanguageName } from '@/features/quantum-document-transformer/supportedLanguages'
import { type QuantumDocumentHistoryItem } from '@/features/quantum-document-transformer/actions/getQuantumDocumentHistory'
import { UpgradeToProBanner } from '@/features/quantum-document-transformer/components/UpgradeToProBanner'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'
import { MAX_SYNCHRONOUS_UPLOAD_BYTES } from '@/features/quantum-document-transformer/maxSynchronousUploadSize'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import { DocumentHistorySidebar } from '@/features/quantum-document-transformer/components/DocumentHistorySidebar'
import { logger } from '@/lib/logger'

const ACCEPT = [
  'application/pdf',
  '.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt',
  'text/plain',
  '.png',
  'image/png',
  '.jpg',
  '.jpeg',
  'image/jpeg',
].join(',')

// Descriptive step copy shown while the single real request (extract →
// Claude call → save) is in flight. There's no real server-sent progress
// signal for a one-shot request/response, so these map onto the same
// fake-but-honest progress ticker already used elsewhere in this app
// (e.g. NewLearningProjectWizard's own upload progress) — the thresholds
// just decide which real *stage name* is shown, not a fabricated byte count.
const PROCESSING_STEPS = [
  { threshold: 0, message: 'Reading document content...' },
  { threshold: 35, message: 'Building Spider Notes & AI Summary...' },
  { threshold: 75, message: 'Preparing Quantum Session...' },
] as const

function getProcessingMessage(progress: number): string {
  let message: string = PROCESSING_STEPS[0].message
  for (const step of PROCESSING_STEPS) {
    if (progress >= step.threshold) message = step.message
  }
  return message
}

type UploadState = {
  displayName: string
  displaySizeBytes: number
  status: UploadProgressStatus
  progress: number
  errorMessage: string | null
}

type TransformResponse =
  | { success: true; document: QuantumDocument }
  | { success: false; error: string; code?: string }

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, '')
}

// A compact preview of the file about to be transformed — a real local
// image thumbnail (via URL.createObjectURL, revoked on change/unmount, the
// same convention ImagePreviewGrid.tsx already established) for images,
// and a name/size chip for everything else, since PDFs/DOCX/TXT have no
// meaningful visual preview to show.
function FilePreview({ file, onReplace, onRemove }: { file: File; onReplace: () => void; onRemove: () => void }): React.JSX.Element {
  const isImage = file.type.startsWith('image/')
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isImage) return undefined
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-4">
      {isImage && objectUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- a real, local, temporary object URL preview; next/image's remote-optimization pipeline doesn't apply here.
        <img src={objectUrl} alt={`Preview of ${file.name}`} className="size-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-5 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onReplace} aria-label={`Replace ${file.name}`}>
        <RotateCcw className="size-4" aria-hidden="true" />
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${file.name}`}>
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}

// Multi-Language Support — the selector shown right above the drop zone.
// A plain, uncontrolled-looking Select rather than anything fancier: the
// choice only matters once, at upload time, so it doesn't need its own
// card or explanation beyond the label.
function LanguageSelector({ value, onChange, disabled }: { value: SupportedLanguage; onChange: (language: SupportedLanguage) => void; disabled: boolean }): React.JSX.Element {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs font-medium text-muted-foreground">Generate in</p>
      <Select value={value} onValueChange={(next) => onChange(next as SupportedLanguage)} disabled={disabled}>
        <SelectTrigger size="sm" aria-label="Language for generated study material">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>{language.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// The real-time transform progress view — replaces the generic
// "Uploading… X%" copy with the three named stages this feature was
// asked to surface, driven by the same underlying progress number.
function TransformingProgress({ fileName, sizeBytes, progress }: { fileName: string; sizeBytes: number; progress: number }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="size-5 animate-pulse text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(sizeBytes)}</p>
        </div>
      </div>
      <Progress value={progress} className="mt-4" />
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{getProcessingMessage(progress)}</p>
    </div>
  )
}

// Compact Upload Trigger™ — the mobile half of Smart Transformer,
// Responsive Cross-Device™: a bespoke, single-row alternative to the
// shared UploadZone's large dashed drop zone, rendered only below the sm
// breakpoint (see the render() below, which shows the real UploadZone at
// sm and above instead). Built bespoke rather than shrinking UploadZone
// itself, since that component is also used at full size by
// NewLearningProjectWizard. Keeps the exact same click-to-browse +
// drag-and-drop mechanics as UploadZone, just in a compact shell.
function CompactUploadTrigger({ onFileSelected, errorMessage }: { onFileSelected: (file: File) => void; errorMessage: string | null }): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList | null): void {
    const file = fileList?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/20',
          isDragging && 'border-primary bg-primary/5',
        )}
      >
        <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <UploadCloud className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Upload a document</p>
          <p className="truncate text-xs text-muted-foreground">PDF · Word · Text · Image — tap or drop</p>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(event) => { handleFiles(event.target.files); event.target.value = '' }} />
      </div>
      {errorMessage && (
        <p className="mt-2 text-xs text-destructive" role="alert">{errorMessage}</p>
      )}
    </div>
  )
}

// Recent Documents™ — the dashboard's only document-related content now.
// A compact quick-access row, not the heavy output itself (that lives on
// its own page — see /library/[id]/page.tsx). Capped at 1 to save mobile
// vertical space; "My Library" (Document History™) is still the way to
// browse everything.
function RecentDocuments({ documents }: { documents: readonly QuantumDocumentHistoryItem[] }): React.JSX.Element {
  return (
    <div className="mb-4">
      <p className={TYPOGRAPHY.label}>Recent Document</p>
      <ul className="mt-2 space-y-2">
        {documents.slice(0, 1).map((document) => (
          <li key={document.id}>
            <Link
              href={`/library/${document.id}`}
              className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-foreground">{document.title}</p>
                  {document.targetLanguage !== 'en' && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">{getLanguageName(document.targetLanguage)}</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeDate(document.createdAt)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// AI Document Transformer™ — drops straight into the real single-call
// pipeline at /api/quantum-documents/transform: real text extraction for
// PDF/DOCX/TXT/Image (images via Claude vision, see extractImage.ts), one
// Claude Haiku call forced into a strict tool-use JSON shape, saved to
// quantum_documents. On success, this widget navigates straight to the
// document's own page (/library/[id]) — Isolated Document View™ — so the
// main dashboard feed never has to render the heavy output inline.
type AIDocumentTransformerWidgetProps = {
  isPro: boolean
  initialDocumentCount: number
  recentDocuments: readonly QuantumDocumentHistoryItem[]
}

export function AIDocumentTransformerWidget({ isPro, initialDocumentCount, recentDocuments }: AIDocumentTransformerWidgetProps): React.JSX.Element {
  const router = useRouter()
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [upload, setUpload] = useState<UploadState | null>(null)
  // Pro Paywall — starts from the real count the dashboard fetched at page
  // load, then tracked locally so a free user hits the real limit within
  // the same session without needing a full page reload. The Route
  // Handler is still the real enforcement boundary (see
  // /api/quantum-documents/transform) — this local count only drives the
  // proactive UI block, never the actual decision.
  const [documentCount, setDocumentCount] = useState(initialDocumentCount)
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [historyOpen, setHistoryOpen] = useState(false)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()

  // Document History & Library — the sidebar nav's "My Library" link is
  // the only entry point now (the in-widget History button was removed
  // per user feedback); it navigates here with `?library=open` so it
  // works from any dashboard page, not just when already on /dashboard.
  // Deliberately never strips the param back off afterward: both
  // next/navigation's router.replace AND a raw history.replaceState
  // trigger Next's App Router to reconcile the route, which raced with —
  // and sometimes silently cancelled — DocumentHistorySidebar's own fetch
  // on first open (a real regression found while verifying this). A
  // `?library=open` left in the address bar is harmless — the same
  // "URL reflects UI state" pattern plenty of modal/drawer flows already
  // use — so it's not worth reintroducing that race just to tidy it up.
  useEffect(() => {
    if (searchParams.get('library') === 'open') setHistoryOpen(true)
  }, [searchParams])

  const isBlocked = !isPro && documentCount >= FREE_TIER_DOCUMENT_LIMIT

  function stopProgressTimer(): void {
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
      progressTimer.current = null
    }
  }

  async function submitDocument(file: File): Promise<void> {
    setUpload({ displayName: stripExtension(file.name), displaySizeBytes: file.size, status: 'uploading', progress: 0, errorMessage: null })

    progressTimer.current = setInterval(() => {
      setUpload((current) => {
        if (!current || current.status !== 'uploading') return current
        const next = Math.min(current.progress + Math.random() * 8, 92)
        return { ...current, progress: next }
      })
    }, 260)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('target_language', targetLanguage)
      const response = await fetch('/api/quantum-documents/transform', { method: 'POST', body: formData })
      const json = (await response.json()) as TransformResponse
      stopProgressTimer()

      if (!json.success) {
        logger.error('[QuantumDocumentTransformer] Transform request failed', { error: json.error, code: json.code })

        // Pro Paywall — a race with another tab/device, or a stale prop,
        // can mean the client thought there was room when the real,
        // server-side count says otherwise. Fall through to the same
        // proactive banner rather than a generic retry-able error.
        if (json.code === 'free_limit_reached') {
          setDocumentCount(FREE_TIER_DOCUMENT_LIMIT)
          setUpload(null)
          setSelectedFile(null)
          return
        }

        setUpload((current) => (current ? { ...current, status: 'error', progress: 0, errorMessage: json.error } : current))
        return
      }

      // A deliberate held beat at "Preparing Quantum Session..." before
      // the transition, so success doesn't feel like an abrupt jump cut.
      setUpload((current) => (current ? { ...current, status: 'processing', progress: 100 } : current))
      await new Promise((resolve) => setTimeout(resolve, 650))

      setDocumentCount((current) => current + 1)
      // Isolated Document View™ — the fresh result now lives on its own
      // page instead of rendering inline here.
      router.push(`/library/${json.document.id}`)
    } catch (error) {
      stopProgressTimer()
      logger.error('[QuantumDocumentTransformer] Transform request threw', { error: error instanceof Error ? error.message : 'Unknown error.' })
      setUpload((current) => (current ? { ...current, status: 'error', progress: 0, errorMessage: 'Something went wrong. Please try again.' } : current))
    }
  }

  async function handleFileSelected(file: File): Promise<void> {
    setZoneError(null)
    const validated = await universalUploadParser.parse(file)
    if (!validated.success) {
      setZoneError(validated.error.message)
      return
    }
    // documents/index.ts's MAX_DOCUMENT_SIZE_BYTES (200 MB, checked just
    // above by universalUploadParser) governs a different upload flow
    // where the file itself never reaches a server function. This one
    // does — a single synchronous request to a Vercel serverless function
    // — which hard-caps request bodies well below what that check allows.
    // Rejecting here, before ever calling fetch(), turns what was
    // otherwise a silent platform-level crash (real user testing: uploads
    // failing with a generic "Something went wrong" late in processing)
    // into an honest, immediate, actionable message.
    if (file.size > MAX_SYNCHRONOUS_UPLOAD_BYTES) {
      setZoneError(`This file is too large for instant processing. Please choose a file up to ${formatFileSize(MAX_SYNCHRONOUS_UPLOAD_BYTES)}.`)
      return
    }
    setSelectedFile(file)
  }

  function handleReplaceChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (file) void handleFileSelected(file)
    event.target.value = ''
  }

  function handleRemove(): void {
    setSelectedFile(null)
    setZoneError(null)
  }

  function handleRetry(): void {
    if (selectedFile) void submitDocument(selectedFile)
  }

  function handleCancel(): void {
    stopProgressTimer()
    setUpload(null)
    setZoneError(null)
  }

  const remainingFreeDocuments = FREE_TIER_DOCUMENT_LIMIT - documentCount

  return (
    <div className="glass-premium-card glass-premium-lift glass-premium-card--emphasized p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Upload &amp; Learn</p>
        </div>
        {!isPro && !isBlocked && (
          <p className="text-xs text-muted-foreground">
            {remainingFreeDocuments} free document{remainingFreeDocuments !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      <div className="mt-4">
        {!isBlocked && (
          <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} disabled={upload !== null} />
        )}

        {isBlocked ? (
          <UpgradeToProBanner documentLimit={FREE_TIER_DOCUMENT_LIMIT} />
        ) : upload ? (
          upload.status === 'error' ? (
            <UploadProgress
              fileName={upload.displayName}
              sizeBytes={upload.displaySizeBytes}
              progress={upload.progress}
              status={upload.status}
              errorMessage={upload.errorMessage}
              onRetry={handleRetry}
              onCancel={handleCancel}
            />
          ) : (
            <TransformingProgress fileName={upload.displayName} sizeBytes={upload.displaySizeBytes} progress={upload.progress} />
          )
        ) : selectedFile ? (
          <div className="space-y-4">
            <FilePreview file={selectedFile} onReplace={() => replaceInputRef.current?.click()} onRemove={handleRemove} />
            <input ref={replaceInputRef} type="file" accept={ACCEPT} className="sr-only" onChange={handleReplaceChange} />
            <Button type="button" size="lg" className="w-full rounded-full" onClick={() => void submitDocument(selectedFile)}>
              Transform into study material
            </Button>
          </div>
        ) : (
          <>
            {recentDocuments.length > 0 && <RecentDocuments documents={recentDocuments} />}

            {/* Smart Transformer, Responsive Cross-Device™ — a compact
                tap-to-upload row below the sm breakpoint (640px), the
                shared UploadZone's full drag-and-drop surface at sm and
                above. Same handleFileSelected callback either way. */}
            <div className="sm:hidden">
              <CompactUploadTrigger onFileSelected={(file) => void handleFileSelected(file)} errorMessage={zoneError} />
            </div>
            <div className="hidden sm:block">
              <UploadZone
                onFileSelected={(file) => void handleFileSelected(file)}
                accept={ACCEPT}
                title="Drop PDFs, Word Docs, Text files, or Images/Notes here"
                subtitle="or click to browse"
                helperText="PDF · Word (.docx) · Text · PNG/JPEG"
                errorMessage={zoneError}
              />
            </div>
          </>
        )}
      </div>

      <DocumentHistorySidebar open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  )
}
