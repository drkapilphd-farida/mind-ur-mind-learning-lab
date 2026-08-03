'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLearningProjectWithDocument } from '@/app/preview/learning-projects/new/actions'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { AIDetectionStep } from '@/components/learning/AIDetectionStep'
import { LearningGoalStep } from '@/components/learning/LearningGoalStep'
import { CameraCaptureExperience } from '@/components/learning/CameraCaptureExperience'
import { ImagePreviewGrid } from '@/components/learning/ImagePreviewGrid'
import { SingleFilePreview } from '@/components/learning/SingleFilePreview'
import { UploadProgress, type UploadProgressStatus } from '@/components/learning/UploadProgress'
import { UploadZone } from '@/components/learning/UploadZone'
import { ACCEPTED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from '@/constants/documents'
import type { UploadLearningGoalId } from '@/constants/learning/uploadLearningGoals'
import { universalUploadParser } from '@/core/universal-learning-engine/upload'
import { analyzeDocumentContent } from '@/lib/processing/analyzeDocumentContent'
import { trackEvent } from '@/lib/analytics/track'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ArrivalBackground } from '@/components/welcome/ArrivalBackground'
import { AIPresenceLogo } from '@/components/welcome/AIPresenceLogo'
import { OnboardingJourneyIndicator } from '@/components/welcome/OnboardingJourneyIndicator'

type AcceptedMimeType = (typeof ACCEPTED_DOCUMENT_MIME_TYPES)[number]

// AI Learning Studio™ V1 Launch UX Transformation — Screen 2, "Upload
// Experience." One combined accept string covering every real, enabled
// Version-1 format (pdf/docx/text/images) — the file's own real MIME
// type (still validated by validateAndExtract/universalUploadParser,
// unchanged) determines branching, never a manual pre-selection card.
// Audio is deliberately absent: no accepted MIME type or extraction
// engine exists for it yet, and advertising it would be dishonest.
const UNIFIED_ACCEPT = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  '.doc',
  '.docx',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt',
  'text/plain',
].join(',')

const MAX_SIZE_MB_LABEL = `${Math.round(MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024))} MB`

type UploadState = {
  displayName: string
  displaySizeBytes: number
  status: UploadProgressStatus
  progress: number
  errorMessage: string | null
}

type SubmitDocumentInput = {
  file: File
  documentTitle: string
  mimeType: AcceptedMimeType
  sizeBytes: number
}

type WizardStep = 'upload' | 'detecting' | 'goal'

const STEP_NUMBER: Record<WizardStep, number> = {
  upload: 1,
  detecting: 2,
  goal: 3,
}
const TOTAL_STEPS = 3

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, '')
}

// A coarse, disclosed heuristic only — never a claim of real per-document
// analysis (difficulty/memory density/etc. don't exist until Processing).
// Pre-selects Screen 4's Learning Goal off the same size-derived estimate
// Screen 3 already shows honestly as an estimate.
function recommendUploadGoal(estimatedReadingMinutes: number): UploadLearningGoalId {
  if (estimatedReadingMinutes <= 10) return 'read-faster'
  if (estimatedReadingMinutes <= 30) return 'deep-understanding'
  return 'remember-longer'
}

// Universal Upload Experience™ (Sprint LW-1C.2) — "Upload Anything. Learn
// Smarter." Reuses the existing wizard/upload architecture end to end
// (createLearningProjectWithDocument, validateDocumentFile, UploadZone,
// UploadProgress) — only the `source` step's content, the range of
// genuinely-accepted formats, and the `upload` step's per-type branching
// are new. Every format still funnels into this exact same action and the
// exact same downstream AI Processing Experience™.
//
// AI Learning Studio™ V1 Launch UX Transformation — the 9-card source
// picker and the separate mandatory "name your project" screen are gone.
// The wizard is now 3 steps: Upload (one hero drop zone, format inferred
// from the real file) → AI Detection (real, already-computed values;
// optional inline title edit) → Learning Goal (one question, four
// options). No business logic changed: the same `submitDocument` call,
// the same `createLearningProjectWithDocument` action, the same real
// Storage upload.
export function NewLearningProjectWizard(): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [step, setStep] = useState<WizardStep>('upload')
  const [projectTitle, setProjectTitle] = useState('')
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [upload, setUpload] = useState<UploadState | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSubmitInput = useRef<{ input: SubmitDocumentInput; goal: UploadLearningGoalId | null } | null>(null)
  const cancelledRef = useRef(false)

  function stopProgressTimer(): void {
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
      progressTimer.current = null
    }
  }

  // AI Learning Studio™ Sprint ALS-10 (Universal Content Engine™
  // Foundation, UCE-1) — the real Storage upload. Until this sprint, an
  // uploaded file's real bytes never left the browser; only its metadata
  // was ever persisted. Path convention (`{user_id}/{uuid}/{filename}`)
  // matches the bucket's own RLS policy exactly (see
  // supabase/migrations/20260719000001_create_learning_documents_bucket.sql).
  // Failure here is honestly non-fatal: the project/document row can
  // still be created metadata-only (exactly like every sprint before this
  // one) rather than losing the whole submission over a storage-specific
  // failure — real extraction simply won't have a file to read later, the
  // same "not processed yet" honesty the app already shows for a document
  // with no Universal Learning Object™ built yet.
  // ALS-15.2 Universal Upload Pipeline Recovery™ — ROOT CAUSE FOUND HERE.
  // This function used to swallow every real Storage upload failure
  // completely (`if (error) return null`, no log of any kind, anywhere).
  // A real failure here (RLS rejection, network error, quota) meant
  // `storagePath` silently became `null`; the project/document row still
  // got created (by design, as a metadata-only fallback), but with
  // `storage_path: null` — which means `runQuickIntelligence` takes its
  // own honest "no stored file" early exit (`outcome: 'ready-no-ulo'`)
  // and marks the document straight to `'ready'`. No error was ever
  // shown anywhere, in any learning mode, because none was ever thrown —
  // the document simply has no real content, forever, in every mode
  // equally (exactly the reported "regardless of learning mode" symptom).
  // Real failures are now logged to the browser console with the actual
  // Supabase error, never silently discarded.
  async function uploadDocumentFile(file: File): Promise<string | null> {
    logger.info('[UploadPipeline] Storage Upload — START', { fileName: file.name, sizeBytes: file.size })
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      logger.error('[UploadPipeline] Storage Upload — FAIL', { reason: 'no authenticated user at upload time' })
      return null
    }

    const path = `${user.id}/${crypto.randomUUID()}/${file.name}`
    const { data, error } = await supabase.storage.from('learning-documents').upload(path, file)
    if (error) {
      logger.error('[UploadPipeline] Storage Upload — FAIL', { path, error: error.message, name: error.name })
      return null
    }

    logger.info('[UploadPipeline] Storage Upload — SUCCESS', { path: data.path })
    return data.path
  }

  async function submitDocument(input: SubmitDocumentInput, goal: UploadLearningGoalId | null): Promise<void> {
    cancelledRef.current = false
    lastSubmitInput.current = { input, goal }
    setUpload({ displayName: input.documentTitle, displaySizeBytes: input.sizeBytes, status: 'uploading', progress: 0, errorMessage: null })
    trackEvent('upload_started', { fileName: input.documentTitle, sizeBytes: input.sizeBytes })
    logger.info('[UploadPipeline] Upload Started', { fileName: input.documentTitle, mimeType: input.mimeType, sizeBytes: input.sizeBytes })

    progressTimer.current = setInterval(() => {
      setUpload((current) => {
        if (!current || current.status !== 'uploading') return current
        const next = Math.min(current.progress + Math.random() * 18, 90)
        return { ...current, progress: next }
      })
    }, 220)

    const storagePath = await uploadDocumentFile(input.file)

    logger.info('[UploadPipeline] Document Record Created — START', { hasStoragePath: storagePath !== null })
    const result = await createLearningProjectWithDocument({
      ...(projectTitle.trim().length > 0 ? { projectTitle: projectTitle.trim() } : {}),
      documentTitle: input.documentTitle,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      ...(storagePath !== null ? { storagePath } : {}),
    })

    stopProgressTimer()

    // ALS-15.2 — the one consolidated Pipeline Timeline this sprint asks
    // for, printed once per real upload attempt, before any navigation.
    logger.info('[UploadPipeline] Timeline', {
      'File Upload': '✓',
      'Storage Save': storagePath !== null ? '✓' : '❌ (see Storage Upload FAIL above — document will have no real content)',
      'Database Save': result.success ? '✓' : `❌ ${!result.success ? result.error : ''}`,
    })

    // AI Learning Studio™ Sprint ALS-2 — real cancel semantics. If the
    // learner cancelled while this call was in flight, discard whatever
    // it resolved to: no error/processing state, no navigation. Honesty
    // note: if the call had already succeeded server-side, the created
    // project/document row is not retroactively deleted — no delete
    // capability exists yet, and adding one is new backend surface this
    // sprint's "no document ingestion" boundary doesn't cover. Cancel
    // only ever stops the *client* from acting on the result.
    if (cancelledRef.current) {
      cancelledRef.current = false
      return
    }

    if (!result.success) {
      logger.error('[UploadPipeline] Document Record Created — FAIL', { error: result.error })
      setUpload((current) => (current ? { ...current, status: 'error', progress: 0, errorMessage: result.error } : current))
      return
    }
    logger.info('[UploadPipeline] Document Record Created — SUCCESS', { projectId: result.projectId, documentId: result.documentId })

    setUpload((current) => (current ? { ...current, status: 'processing', progress: 100 } : current))
    trackEvent('upload_completed', { fileName: input.documentTitle, sizeBytes: input.sizeBytes })
    trackEvent('project_created', { projectId: result.projectId })

    const goalParam = goal ? `?goal=${goal}` : ''
    router.push(`/preview/learning-projects/${result.projectId}/processing${goalParam}`)
  }

  // Sprint UCE-1 — Universal Upload Parser™. Every file now goes through
  // the one shared engine (src/core/universal-learning-engine/upload)
  // instead of calling validateDocumentFile/documentTextExtraction
  // directly — same underlying checks, same resulting messages, now
  // reached through the platform's single upload gateway. The parser's
  // own UniversalSource output isn't used yet (this wizard still submits
  // via createLearningProjectWithDocument exactly as before); only the
  // validation/readability-check call path changed.
  async function validateAndExtract(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
    const result = await universalUploadParser.parse(file)
    if (!result.success) {
      return { ok: false, error: result.error.message }
    }
    return { ok: true }
  }

  async function handleFileSelectedForReview(file: File): Promise<void> {
    setZoneError(null)
    const outcome = await validateAndExtract(file)
    if (!outcome.ok) {
      setZoneError(outcome.error)
      return
    }
    setSelectedFile(file)
    setProjectTitle(stripExtension(file.name))
    setStep('detecting')
  }

  async function handleReplaceSingleFile(file: File): Promise<void> {
    const outcome = await validateAndExtract(file)
    if (!outcome.ok) {
      setZoneError(outcome.error)
      return
    }
    setSelectedFile(file)
    setProjectTitle(stripExtension(file.name))
  }

  function handleRemoveSingleFile(): void {
    setSelectedFile(null)
    setZoneError(null)
    setStep('upload')
  }

  // Used by AI Detection's own "Change file" action — unlike
  // handleRemoveSingleFile (scoped to the single-file path only), this
  // resets whichever real selection is active, single file or images.
  function handleBackToUpload(): void {
    setSelectedFile(null)
    setSelectedImages([])
    setZoneError(null)
    setStep('upload')
  }

  async function handleImagesSelected(files: File[]): Promise<void> {
    setZoneError(null)
    const validFiles: File[] = []
    for (const file of files) {
      const outcome = await validateAndExtract(file)
      if (outcome.ok) {
        validFiles.push(file)
      } else {
        setZoneError(outcome.error)
      }
    }
    if (validFiles.length > 0) {
      setSelectedImages((current) => {
        const next = [...current, ...validFiles]
        const first = next[0]
        if (current.length === 0 && first) {
          setProjectTitle(next.length === 1 ? stripExtension(first.name) : `${next.length} images`)
        }
        return next
      })
      setStep('detecting')
    }
  }

  function handleRemoveImage(index: number): void {
    setSelectedImages((current) => {
      const next = current.filter((_, i) => i !== index)
      if (next.length === 0) setStep('upload')
      return next
    })
  }

  async function handleReplaceImage(index: number, file: File): Promise<void> {
    const outcome = await validateAndExtract(file)
    if (!outcome.ok) {
      setZoneError(outcome.error)
      return
    }
    setSelectedImages((current) => current.map((existing, i) => (i === index ? file : existing)))
  }

  // AI Learning Studio™ V1 Launch UX Transformation — the single real
  // entry point for the unified Upload Experience™: every selected file,
  // regardless of how many or which real format, arrives here. An
  // all-images selection becomes the existing multi-image review flow;
  // anything else is treated as a single document (only one Document row
  // can ever be created per real submission — see handleContinueWithImages'
  // own comment on that same, pre-existing, disclosed limit) — a mixed or
  // multi-file non-image selection honestly uses just the first file
  // rather than silently discarding the rest with no explanation.
  async function handleFilesSelected(files: File[]): Promise<void> {
    setZoneError(null)
    if (files.length === 0) return

    logger.info('[UploadPipeline] File Selected', { count: files.length, names: files.map((file) => file.name), types: files.map((file) => file.type) })

    const allImages = files.every((file) => file.type.startsWith('image/'))
    if (allImages) {
      await handleImagesSelected(files)
      return
    }

    const [first] = files
    if (!first) return
    if (files.length > 1) setZoneError('You can bring one document at a time — we used the first file you selected.')
    await handleFileSelectedForReview(first)
  }

  function handleCameraCapture(file: File): void {
    setShowCamera(false)
    void handleFileSelectedForReview(file)
  }

  function handleRetry(): void {
    if (lastSubmitInput.current) void submitDocument(lastSubmitInput.current.input, lastSubmitInput.current.goal)
  }

  // AI Learning Studio™ Sprint ALS-2 — cancel now works during an active
  // upload, not only after an error (previously `onCancel` was only ever
  // wired up for the 'error' status). See submitDocument's own comment
  // for what a mid-flight cancel does and does not undo server-side.
  function handleCancel(): void {
    cancelledRef.current = true
    stopProgressTimer()
    setUpload(null)
    setZoneError(null)
  }

  // Real, already-computed values (analyzeDocumentContent/
  // detectDocumentStructure, both pure/synchronous) for whichever real
  // selection is active — feeds both Screen 3's display and Screen 4's
  // coarse default. No new analysis logic; these two functions already
  // existed, previously only called from ProcessingExperience.tsx.
  const detectionSubject = selectedFile ?? selectedImages[0] ?? null
  const detectionSizeBytes = selectedFile ? selectedFile.size : selectedImages.reduce((sum, file) => sum + file.size, 0)
  const analysis = useMemo(() => (detectionSubject ? analyzeDocumentContent({ mimeType: detectionSubject.type, sizeBytes: detectionSizeBytes }) : null), [detectionSubject, detectionSizeBytes])
  const recommendedGoalId = useMemo(() => recommendUploadGoal(analysis?.estimatedReadingMinutes ?? 0), [analysis])

  function handleContinueFromDetection(): void {
    setStep('goal')
  }

  function handleContinueFromGoal(goal: UploadLearningGoalId): void {
    if (selectedFile) {
      void submitDocument({ file: selectedFile, documentTitle: stripExtension(selectedFile.name), mimeType: selectedFile.type as AcceptedMimeType, sizeBytes: selectedFile.size }, goal)
      return
    }
    const firstImage = selectedImages[0]
    if (!firstImage) return
    const totalBytes = selectedImages.reduce((sum, file) => sum + file.size, 0)
    const documentTitle = selectedImages.length === 1 ? stripExtension(firstImage.name) : `${selectedImages.length} images`
    void submitDocument({ file: firstImage, documentTitle, mimeType: firstImage.type as AcceptedMimeType, sizeBytes: totalBytes }, goal)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-12">
      <ArrivalBackground />

      <div className="relative mx-auto max-w-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <AIPresenceLogo size={56} />
          <p className={TYPOGRAPHY.label}>Quantum Mind™</p>
          <OnboardingJourneyIndicator currentStepId="method" className="mt-2 w-full max-w-sm" />
        </div>

        <p className={cn(TYPOGRAPHY.label, 'mt-8 text-center')}>
          Step {STEP_NUMBER[step]} of {TOTAL_STEPS}
        </p>

        <div key={step} className={!prefersReducedMotion ? 'animate-in fade-in duration-500' : undefined}>
          {step === 'upload' && (
            <div className="mt-4">
              <h1 className={TYPOGRAPHY.h1}>Upload Your Content</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-2 text-muted-foreground')}>We&rsquo;ll take it from here — your Learning Project will be ready in moments.</p>

              <div className="mt-8">
                {upload ? (
                  <UploadProgress
                    fileName={upload.displayName}
                    sizeBytes={upload.displaySizeBytes}
                    progress={upload.progress}
                    status={upload.status}
                    errorMessage={upload.errorMessage}
                    onRetry={upload.status === 'error' ? handleRetry : undefined}
                    onCancel={upload.status !== 'processing' ? handleCancel : undefined}
                  />
                ) : showCamera ? (
                  <CameraCaptureExperience onCapture={handleCameraCapture} />
                ) : (
                  <div className="space-y-4">
                    <UploadZone
                      onFileSelected={() => {}}
                      onFilesSelected={(files) => void handleFilesSelected(files)}
                      multiple
                      accept={UNIFIED_ACCEPT}
                      title="Bring your knowledge here"
                      helperText={`PDF · Image · Camera · Word · Text · up to ${MAX_SIZE_MB_LABEL}`}
                      errorMessage={zoneError}
                    />
                    <button type="button" onClick={() => setShowCamera(true)} className={cn(TYPOGRAPHY.small, 'mx-auto block text-muted-foreground underline underline-offset-4 hover:text-foreground')}>
                      or use your camera
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'detecting' && analysis && (
            <div className="mt-4">
              <h1 className={TYPOGRAPHY.h1}>Here&rsquo;s what I found</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-2 text-muted-foreground')}>Take a quick look before we build your learning journey.</p>

              <div className="mt-8">
                <AIDetectionStep
                  title={projectTitle}
                  onTitleChange={setProjectTitle}
                  formatLabel={analysis.formatLabel}
                  estimatedReadingMinutes={analysis.estimatedReadingMinutes}
                  sizeBytes={detectionSizeBytes}
                  onContinue={handleContinueFromDetection}
                  onBack={handleBackToUpload}
                >
                  {selectedFile && (
                    <SingleFilePreview file={selectedFile} accept={UNIFIED_ACCEPT} onReplace={(file) => void handleReplaceSingleFile(file)} onRemove={handleRemoveSingleFile} />
                  )}
                  {!selectedFile && selectedImages.length > 0 && (
                    <ImagePreviewGrid images={selectedImages} onRemove={handleRemoveImage} onReplace={(index, file) => void handleReplaceImage(index, file)} />
                  )}
                </AIDetectionStep>
              </div>
            </div>
          )}

          {step === 'goal' && (
            <div className="mt-4">
              <h1 className={TYPOGRAPHY.h1}>How would you like to learn this?</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-2 text-muted-foreground')}>We&rsquo;ve pre-selected what looks like the best fit — change it if you&rsquo;d like.</p>

              <div className="mt-8">
                <LearningGoalStep recommendedGoalId={recommendedGoalId} submitting={upload !== null} onContinue={handleContinueFromGoal} onBack={() => setStep('detecting')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
