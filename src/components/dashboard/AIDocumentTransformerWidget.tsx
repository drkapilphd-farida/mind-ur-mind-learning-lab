'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, Flame, RotateCcw, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UploadZone } from '@/components/learning/UploadZone'
import { UploadProgress, type UploadProgressStatus } from '@/components/learning/UploadProgress'
import { formatFileSize } from '@/lib/formatFileSize'
import { universalUploadParser } from '@/core/universal-learning-engine/upload'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { QuantumDocument } from '@/features/quantum-document-transformer/types'
import { QuantumDocumentSpeedReadingView } from '@/features/quantum-document-transformer/components/QuantumDocumentSpeedReadingView'
import { QuantumDocumentRecallQuizView } from '@/features/quantum-document-transformer/components/QuantumDocumentRecallQuizView'
import { SpiderNotesTreeView } from '@/features/quantum-document-transformer/components/SpiderNotesTreeView'
import { FeynmanChallengeCard } from '@/features/quantum-document-transformer/components/FeynmanChallengeCard'
import { MnemonicsListView } from '@/features/quantum-document-transformer/components/MnemonicsListView'
import { SubjectLensView } from '@/features/quantum-document-transformer/components/SubjectLensView'
import { saveQuantumDocumentSession } from '@/features/quantum-document-transformer/actions/saveQuantumDocumentSession'
import { getQuantumDocumentSessionHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentSessionHistory'
import { computeQuantumDocumentStreak } from '@/features/quantum-document-transformer/quantumDocumentSessionTracking'
import { UpgradeToProBanner } from '@/features/quantum-document-transformer/components/UpgradeToProBanner'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import { DocumentHistorySidebar } from '@/features/quantum-document-transformer/components/DocumentHistorySidebar'
import { SelectionTooltip } from '@/features/quantum-mentor/components/SelectionTooltip'
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

type SessionPhase = 'results' | 'reading' | 'quiz' | 'complete'

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

// Text Selection & Interactive AI Mentor Copilot™ — a static, selectable
// view of the document's own real reading text. Deliberately separate
// from QuantumDocumentSpeedReadingView (the RSVP flash-reader hosted in
// the session Dialog below): RSVP shows one word at a time and has no
// continuous text a user could ever highlight, so this collapsed-by-
// default section is what makes "select text inside Reading Text" a real,
// possible interaction. Collapsed by default and height-capped once open
// — a full document can run to thousands of words, and this section
// exists for highlighting a passage, not for reading start-to-finish
// (that's what the Quantum Session below is for).
function ReadingTextSection({ readingText }: { readingText: string }): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={isExpanded}
      >
        <p className={TYPOGRAPHY.label}>Reading Text</p>
        <span className="text-xs font-medium text-primary">{isExpanded ? 'Hide' : 'Show'}</span>
      </button>

      {isExpanded && (
        <p className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-foreground">{readingText}</p>
      )}
    </div>
  )
}

function QuantumDocumentResultsCard({ document, onStartSession, onReset }: { document: QuantumDocument; onStartSession: () => void; onReset: () => void }): React.JSX.Element {
  return (
    <SelectionTooltip documentContext={`${document.title}\n\n${document.aiSummary}`} documentLanguage={document.targetLanguage}>
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
          <p className={TYPOGRAPHY.label}>Summary</p>
          <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{document.aiSummary}</p>
        </div>

        <SpiderNotesTreeView root={document.spiderNotes} />

        <ReadingTextSection readingText={document.readingText} />

        <FeynmanChallengeCard challenge={document.feynmanChallenge} />
        <MnemonicsListView mnemonics={document.mnemonics} />
        <SubjectLensView lens={document.subjectLens} />

        <div>
          <p className={TYPOGRAPHY.label}>Keywords</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {document.keywords.map((keyword) => (
              <Badge key={keyword} variant="outline">{keyword}</Badge>
            ))}
          </div>
        </div>

        <Button type="button" size="lg" className="w-full rounded-full" onClick={onStartSession}>
          🚀 Start Quantum Session ({document.quizQuestions.length} recall question{document.quizQuestions.length !== 1 ? 's' : ''})
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onReset}>
          Transform another document
        </Button>
      </div>
    </SelectionTooltip>
  )
}

type SessionReward = { xpEarned: number; streak: number }

// Gamification & XP Sync — the celebratory reveal. Reuses the exact same
// animated-count-up + streak-flame visual language DailyQuantumSessionCard
// already established on the real dashboard, so this reads as the same
// reward system, not a one-off. Respects prefers-reduced-motion like every
// other animated number in this app.
function XpGainBadge({ xpEarned, streak }: SessionReward): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedXp = useCountUp(xpEarned, 800, prefersReducedMotion)

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4',
        !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300',
      )}
    >
      <div className="flex items-center gap-2 text-2xl font-bold tabular-nums text-foreground">
        <Sparkles className="size-5 text-indigo-500" aria-hidden="true" />
        +{Math.round(animatedXp)} XP
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Flame className={cn('size-4', streak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')} aria-hidden="true" />
        {streak} day{streak !== 1 ? 's' : ''} streak
      </div>
    </div>
  )
}

function QuantumSessionCompleteCard({ reward, onReset }: { reward: SessionReward | null; onReset: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-foreground/[0.02] p-6 text-center">
      <p className={TYPOGRAPHY.h3}>Session complete 🎉</p>
      <p className={TYPOGRAPHY.small}>You read the document and completed the recall quiz.</p>
      {reward ? (
        <XpGainBadge xpEarned={reward.xpEarned} streak={reward.streak} />
      ) : (
        <p className={cn(TYPOGRAPHY.caption, 'text-muted-foreground')}>We couldn&rsquo;t save your progress this time.</p>
      )}
      <Button type="button" variant="outline" onClick={onReset}>Transform another document</Button>
    </div>
  )
}

// AI Document Transformer™ — drops straight into the real single-call
// pipeline at /api/quantum-documents/transform: real text extraction for
// PDF/DOCX/TXT/Image (images via Claude vision, see extractImage.ts), one
// Claude Haiku call forced into a strict tool-use JSON shape, saved to
// quantum_documents. On success, the returned payload flows directly into
// an in-place Quantum Session (Dialog-hosted): Speed Reading over the
// real extracted text, then an Active Recall quiz over the real generated
// questions — no page navigation, no re-fetch, the exact response this
// request already returned.
type AIDocumentTransformerWidgetProps = {
  isPro: boolean
  initialDocumentCount: number
}

export function AIDocumentTransformerWidget({ isPro, initialDocumentCount }: AIDocumentTransformerWidgetProps): React.JSX.Element {
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [upload, setUpload] = useState<UploadState | null>(null)
  const [result, setResult] = useState<QuantumDocument | null>(null)
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('results')
  const [sessionReward, setSessionReward] = useState<SessionReward | null>(null)
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

      setUpload(null)
      setSelectedFile(null)
      setSessionPhase('results')
      setResult(json.document)
      setDocumentCount((current) => current + 1)
    } catch (error) {
      stopProgressTimer()
      logger.error('[QuantumDocumentTransformer] Transform request threw', { error: error instanceof Error ? error.message : 'Unknown error.' })
      setUpload((current) => (current ? { ...current, status: 'error', progress: 0, errorMessage: 'Something went wrong. Please try again.' } : current))
    }
  }

  async function handleFileSelected(file: File): Promise<void> {
    setZoneError(null)
    setResult(null)
    const validated = await universalUploadParser.parse(file)
    if (!validated.success) {
      setZoneError(validated.error.message)
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

  function handleReset(): void {
    setResult(null)
    setSessionPhase('results')
    setSessionReward(null)
    setSelectedFile(null)
    setZoneError(null)
  }

  // Document History & Library — loads a past document's already-generated
  // payload straight into the same `result` state a fresh transform would
  // populate, so every downstream view (Spider Notes, Feynman Challenge,
  // the Quantum Session dialog) works unchanged. Deliberately does not
  // touch `documentCount`: reopening a document a learner already paid
  // for (in tokens or in a free-tier slot) is not a new upload.
  function handleSelectHistoryDocument(document: QuantumDocument): void {
    stopProgressTimer()
    setUpload(null)
    setSelectedFile(null)
    setZoneError(null)
    setSessionReward(null)
    setSessionPhase('results')
    setResult(document)
  }

  // Gamification & XP Sync — fires once, when the learner finishes BOTH
  // real halves of the session (speed reading + self-assessed recall
  // quiz). The XP number itself is never computed here — the Server
  // Action recomputes it from the real correctAnswersCount so a tampered
  // client request can't award arbitrary XP. The streak shown is
  // recomputed fresh from the user's own real session history
  // immediately after this session is saved, not incremented by hand.
  async function handleQuizComplete(correctAnswersCount: number, totalQuestionsCount: number): Promise<void> {
    if (!result) return

    const saveResult = await saveQuantumDocumentSession({
      quantumDocumentId: result.id,
      correctAnswersCount,
      totalQuestionsCount,
    })

    if (saveResult.success) {
      const history = await getQuantumDocumentSessionHistory()
      setSessionReward({ xpEarned: saveResult.xpEarned, streak: computeQuantumDocumentStreak(history) })
    } else {
      logger.error('[QuantumDocumentTransformer] Session Saved — FAIL', { error: saveResult.error })
      setSessionReward(null)
    }

    setSessionPhase('complete')
  }

  const sessionDialogOpen = result !== null && (sessionPhase === 'reading' || sessionPhase === 'quiz')

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">AI Document Transformer™</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Drop PDFs, Word Docs, Text files, or Images/Notes here — we&rsquo;ll turn them into a summary, spider notes, keywords, and a quiz.</p>

      <div className="mt-5">
        {!result && !isBlocked && (
          <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} disabled={upload !== null} />
        )}

        {result ? (
          sessionPhase === 'complete' ? (
            <QuantumSessionCompleteCard reward={sessionReward} onReset={handleReset} />
          ) : (
            <QuantumDocumentResultsCard document={result} onStartSession={() => setSessionPhase('reading')} onReset={handleReset} />
          )
        ) : isBlocked ? (
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
          <UploadZone
            onFileSelected={(file) => void handleFileSelected(file)}
            accept={ACCEPT}
            title="Drop PDFs, Word Docs, Text files, or Images/Notes here"
            subtitle="or click to browse"
            helperText="PDF · Word (.docx) · Text · PNG/JPEG"
            errorMessage={zoneError}
          />
        )}
      </div>

      {result && (
        <Dialog open={sessionDialogOpen} onOpenChange={(open) => { if (!open) setSessionPhase('results') }}>
          <DialogContent className="flex h-[85vh] max-w-3xl flex-col p-6 sm:max-w-3xl" showCloseButton={false}>
            <DialogTitle className="sr-only">{result.title} — Quantum Session</DialogTitle>
            {sessionPhase === 'reading' && (
              <QuantumDocumentSpeedReadingView
                title={result.title}
                readingText={result.readingText}
                onComplete={() => setSessionPhase(result.quizQuestions.length > 0 ? 'quiz' : 'complete')}
                onExit={() => setSessionPhase('results')}
              />
            )}
            {sessionPhase === 'quiz' && (
              <QuantumDocumentRecallQuizView
                title={result.title}
                quizQuestions={result.quizQuestions}
                onComplete={(correctAnswersCount, totalQuestionsCount) => void handleQuizComplete(correctAnswersCount, totalQuestionsCount)}
                onExit={() => setSessionPhase('results')}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      <DocumentHistorySidebar open={historyOpen} onOpenChange={setHistoryOpen} onSelectDocument={handleSelectHistoryDocument} />
    </div>
  )
}
