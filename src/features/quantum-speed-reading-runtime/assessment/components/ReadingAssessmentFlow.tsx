'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { computeLiveWpm } from '@/features/quantum-speed-reading/readingSessionEngine'
import type { DocumentComprehensionSignal } from '../../presentation/listDocumentComprehensionSignals'
import type { AssessmentPassage } from '../selectAssessmentPassages'
import { resolveReadingStyle } from '../resolveReadingStyle'
import { recommendQsrMode } from '../../presentation/recommendQsrMode'
import { buildAssessmentQuestions } from '../questions/buildAssessmentQuestions'
import type { AssessmentQuestion } from '../questions/AssessmentQuestion'
import { saveReadingAssessment } from '../actions/saveReadingAssessment'
import { AssessmentStageIndicator } from './AssessmentStageIndicator'
import { AssessmentSpeedPicker, type AssessmentPace } from './AssessmentSpeedPicker'
import { AssessmentStageReadingView } from './AssessmentStageReadingView'
import { AssessmentQuestionScreen } from './AssessmentQuestionScreen'
import { AssessmentCompleteScreen } from './AssessmentCompleteScreen'

type ReadingAssessmentFlowProps = {
  documentId: string
  documentTitle: string
  passages: readonly AssessmentPassage[]
  comprehensionSignals: readonly DocumentComprehensionSignal[]
}

type StageResultDraft = {
  stage: AssessmentPassage['stage']
  chunkNodeId: string
  selfSelectedPace: AssessmentPace
  wpm: number
  readingTimeMs: number
  questionCount: number
  correctCount: number
}

type FlowStep = 'welcome' | 'pace' | 'reading' | 'questions' | 'analyzing' | 'complete' | 'error'

// Reading Assessment Engine™ — the orchestrator (Production Prompt 01A).
// Welcome → 4× [pace pick → real reading → real questions] → Analyzing →
// Complete. Owns the one piece of state every stage needs
// (`stageResults`) and real per-stage timing (`Date.now()` /
// `computeLiveWpm`, reused verbatim from `ReadingSprintView.tsx` — never
// a new timing mechanism). Renders instead of `ReadingWorkspace` only
// when the read route's own server check (`checkReadingAssessmentExists`)
// found no assessment yet — see `page.tsx`'s new branch. On completion,
// `router.refresh()` re-runs that same server check, which now finds the
// just-saved row and renders the real, completely unmodified
// `ReadingWorkspace`/Hub — no shared state-machine type touched anywhere.
export function ReadingAssessmentFlow({ documentId, documentTitle, passages, comprehensionSignals }: ReadingAssessmentFlowProps): React.JSX.Element {
  const router = useRouter()
  const [step, setStep] = useState<FlowStep>('welcome')
  const [stageIndex, setStageIndex] = useState(0)
  const [pace, setPace] = useState<AssessmentPace | null>(null)
  const [stageStartedAt, setStageStartedAt] = useState<number | null>(null)
  const [currentQuestions, setCurrentQuestions] = useState<readonly AssessmentQuestion[]>([])
  const [pendingWpm, setPendingWpm] = useState(0)
  const [pendingReadingTimeMs, setPendingReadingTimeMs] = useState(0)
  const [stageResults, setStageResults] = useState<readonly StageResultDraft[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const passage = passages[stageIndex]

  const profile = useMemo(() => {
    if (stageResults.length === 0) return null
    const withComprehension = stageResults.map((result) => ({
      stage: result.stage,
      wpm: result.wpm,
      comprehensionPercent: result.questionCount > 0 ? Math.round((result.correctCount / result.questionCount) * 100) : 0,
    }))
    const paragraphResult = stageResults.find((result) => result.stage === 'paragraph')
    const overallWpm = paragraphResult?.wpm ?? Math.round(stageResults.reduce((sum, result) => sum + result.wpm, 0) / stageResults.length)
    return { overallWpm, readingStyle: resolveReadingStyle(withComprehension), recommendation: recommendQsrMode({ averageWpm: overallWpm, pauseCount: 0 }) }
  }, [stageResults])

  function handleBeginStage(): void {
    setStep('pace')
  }

  function handlePaceSelected(selectedPace: AssessmentPace): void {
    setPace(selectedPace)
    setStageStartedAt(Date.now())
    setStep('reading')
  }

  function handleReadingDone(): void {
    if (!passage || stageStartedAt === null) return
    const readingTimeMs = Date.now() - stageStartedAt
    // Clamped: a very short document can repeat the same passage across
    // stages, and a fast re-read of already-seen text can compute an
    // unrealistic wpm. Matches the ceiling saveReadingAssessment enforces.
    const wpm = Math.min(computeLiveWpm(passage.wordCount, readingTimeMs), 2000)
    const questions = buildAssessmentQuestions(passage, passages, comprehensionSignals)

    setPendingWpm(wpm)
    setPendingReadingTimeMs(readingTimeMs)
    setCurrentQuestions(questions)

    if (questions.length === 0) {
      recordStageResult(wpm, readingTimeMs, 0, 0)
      return
    }
    setStep('questions')
  }

  function handleQuestionsComplete(correctCount: number): void {
    recordStageResult(pendingWpm, pendingReadingTimeMs, currentQuestions.length, correctCount)
  }

  function recordStageResult(wpm: number, readingTimeMs: number, questionCount: number, correctCount: number): void {
    if (!passage || pace === null) return
    const nextResults = [...stageResults, { stage: passage.stage, chunkNodeId: passage.chunkNodeId, selfSelectedPace: pace, wpm, readingTimeMs, questionCount, correctCount }]
    setStageResults(nextResults)
    setPace(null)
    setStageStartedAt(null)
    setCurrentQuestions([])

    if (stageIndex + 1 < passages.length) {
      setStageIndex((index) => index + 1)
      setStep('pace')
      return
    }

    void finishAssessment(nextResults)
  }

  async function finishAssessment(finalResults: readonly StageResultDraft[]): Promise<void> {
    setStep('analyzing')
    const result = await saveReadingAssessment({ documentId, stageResults: finalResults })
    if (!result.success) {
      setErrorMessage(result.error)
      setStep('error')
      return
    }
    setStep('complete')
  }

  if (step === 'welcome') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-base)">
        <Card>
          <CardContent className="space-y-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className={TYPOGRAPHY.h2}>Let&rsquo;s discover how you naturally read</h1>
              <p className={TYPOGRAPHY.small}>
                We&rsquo;ll understand how you naturally read &quot;{documentTitle}.&quot; This takes about 3–5 minutes.
              </p>
            </div>
            <Button onClick={handleBeginStage}>Continue</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 text-center duration-(--duration-base)">
        <p className={TYPOGRAPHY.h4}>Something went wrong saving your reading assessment</p>
        {errorMessage !== null && <p className={TYPOGRAPHY.small}>{errorMessage}</p>}
        <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (step === 'analyzing') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
        <p className={TYPOGRAPHY.h4}>Generating Your Reading Profile…</p>
      </div>
    )
  }

  if (step === 'complete' && profile !== null) {
    return (
      <AssessmentCompleteScreen
        overallWpm={profile.overallWpm}
        readingStyle={profile.readingStyle}
        recommendationReason={profile.recommendation.reason}
        onEnterHub={() => router.refresh()}
      />
    )
  }

  if (!passage) return <></>

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <AssessmentStageIndicator currentStage={passage.stage} />

      {step === 'pace' && <AssessmentSpeedPicker onSelect={handlePaceSelected} />}
      {step === 'reading' && <AssessmentStageReadingView stage={passage.stage} content={passage.content} onDone={handleReadingDone} />}
      {step === 'questions' && <AssessmentQuestionScreen questions={currentQuestions} onComplete={handleQuestionsComplete} />}
    </div>
  )
}
