'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { playClickChime, playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { pickDiagnosticPassage, type DiagnosticPassage } from '../diagnosticContent'
import { computeTrueWpm } from '../../trueWpm'
import { saveBaselineDiagnostic } from '../actions/saveBaselineDiagnostic'

const STRICT_TIMER_SECONDS = 30
const QUESTIONS_PER_ATTEMPT = 2
const REVEAL_DURATION_MS = 1100
const TICK_MS = 250
// This figure is locked in permanently and anchors every day of pacing
// across the whole 21-day journey — an accidental instant click on
// "Finished Reading" (a fat-fingered tap, a double-click) could otherwise
// lock in a nonsensical WPM forever. A few seconds is enough to block a
// mis-click without meaningfully affecting a genuinely fast reader's real
// pace measurement.
const MIN_READING_MS = 3000

type Phase = 'reading' | 'question' | 'revealing' | 'saving' | 'result'

function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0)
}

// 30-Second Baseline Speed & Comprehension Diagnostic™ — the mandatory,
// one-time gate a brand-new user completes before their real Day 1 of the
// 21-Day Transformation Journey. Unlike every in-journey reading mode
// (which auto-advances through stages at a computed pace), this passage
// is shown in full and the user reads it at their own natural, untimed-
// per-word pace — the ONLY input is a strict 30-second ceiling and
// whether they click "Finished Reading" early. That's deliberate: this
// diagnostic exists to measure genuine natural reading speed, not a
// paced/assisted one, so nothing here should shape or hint at pace.
export function BaselineDiagnosticExperience(): React.JSX.Element {
  // The passage must be picked client-side only — picking during SSR
  // would render one passage on the server and a different random one on
  // the client, a real hydration mismatch (the same class of bug fixed in
  // JourneyReadingModePlayer).
  const [passage, setPassage] = useState<DiagnosticPassage | null>(null)
  useEffect(() => {
    setPassage(pickDiagnosticPassage())
  }, [])

  const totalWordCount = useMemo(() => (passage !== null ? splitIntoWords(passage.text).length : 0), [passage])

  const [phase, setPhase] = useState<Phase>('reading')
  const [readingStartedAt, setReadingStartedAt] = useState<number | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState(STRICT_TIMER_SECONDS)
  const [readingElapsedMs, setReadingElapsedMs] = useState(0)
  const [canFinishEarly, setCanFinishEarly] = useState(false)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<{ isCorrect: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [result, setResult] = useState<{ rawWpm: number; accuracyPercent: 0 | 50 | 100; trueBaselineWpm: number } | null>(null)

  // The strict 30-second timer starts the instant the real passage is on
  // screen, not on component mount (which would shave real reading time
  // off the very first render before the passage is even picked).
  useEffect(() => {
    if (passage === null || readingStartedAt !== null) return
    setReadingStartedAt(Date.now())
  }, [passage, readingStartedAt])

  useEffect(() => {
    if (readingStartedAt === null) return undefined
    const timeout = setTimeout(() => setCanFinishEarly(true), MIN_READING_MS)
    return () => clearTimeout(timeout)
  }, [readingStartedAt])

  useEffect(() => {
    if (phase !== 'reading' || readingStartedAt === null) return undefined
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - readingStartedAt
      const remaining = Math.max(0, Math.ceil((STRICT_TIMER_SECONDS * 1000 - elapsedMs) / 1000))
      setSecondsRemaining(remaining)
      if (elapsedMs >= STRICT_TIMER_SECONDS * 1000) {
        finishReading(STRICT_TIMER_SECONDS * 1000)
      }
    }, TICK_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, readingStartedAt])

  function finishReading(elapsedMsOverride?: number): void {
    if (readingStartedAt === null || phase !== 'reading') return
    playClickChime()
    const elapsedMs = Math.min(elapsedMsOverride ?? Date.now() - readingStartedAt, STRICT_TIMER_SECONDS * 1000)
    setReadingElapsedMs(elapsedMs)
    setPhase('question')
  }

  function resolveGuess(option: string): void {
    if (passage === null) return
    const question = passage.questions[questionIndex]
    if (question === undefined) return
    const correctOptionText = question.options[question.correctIndex]
    const isCorrect = option === correctOptionText

    setSelectedOption(option)
    setLastOutcome({ isCorrect })
    setPhase('revealing')
    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      playCorrectChime()
    } else {
      playGentleMissChime()
    }

    setTimeout(() => {
      const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount
      const nextIndex = questionIndex + 1
      if (nextIndex >= QUESTIONS_PER_ATTEMPT) {
        void finishDiagnostic(finalCorrectCount)
      } else {
        setQuestionIndex(nextIndex)
        setSelectedOption(null)
        setPhase('question')
      }
    }, REVEAL_DURATION_MS)
  }

  async function finishDiagnostic(finalCorrectCount: number): Promise<void> {
    setPhase('saving')
    // Explicitly tri-state per the product spec — exactly 2 questions, so
    // the only honest comprehension figures are 0%, 50%, or 100%, never a
    // generic rounded percentage.
    const accuracyPercent = finalCorrectCount === 2 ? 100 : finalCorrectCount === 1 ? 50 : 0
    const rawWpm = readingElapsedMs > 0 ? Math.round((totalWordCount / readingElapsedMs) * 60000) : 0
    const trueBaselineWpm = computeTrueWpm(rawWpm, accuracyPercent)
    await saveBaselineDiagnostic({ rawWpm, accuracyPercent, trueBaselineWpm })
    setResult({ rawWpm, accuracyPercent, trueBaselineWpm })
    setPhase('result')
  }

  if (passage === null) return <div className="min-h-[70vh]" />

  const question = passage.questions[questionIndex]
  const progressPercent = Math.round((secondsRemaining / STRICT_TIMER_SECONDS) * 100)

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center gap-6 px-6 py-12 text-center">
      {phase === 'reading' && (
        <div className="flex w-full flex-1 flex-col items-center gap-8">
          <div className="flex w-full max-w-xs flex-col items-center gap-2">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">30-Second Baseline Diagnostic™</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{secondsRemaining}s</p>
          </div>

          <p className="max-w-xl text-left text-lg leading-relaxed text-foreground">{passage.text}</p>

          <Button type="button" size="lg" className="rounded-full" disabled={!canFinishEarly} onClick={() => finishReading()}>
            Finished Reading →
          </Button>
        </div>
      )}

      {(phase === 'question' || phase === 'revealing') && question !== undefined && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Quick Check</p>
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Question {questionIndex + 1} of {QUESTIONS_PER_ATTEMPT}
          </p>
          <p className="font-heading text-xl font-bold tracking-tight text-foreground">{question.question}</p>

          {phase === 'revealing' && lastOutcome !== null && (
            <p className={`text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {lastOutcome.isCorrect ? 'Correct!' : `Not quite — it was "${question.options[question.correctIndex]}".`}
            </p>
          )}

          <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isCorrectOption = phase === 'revealing' && option === question.options[question.correctIndex]
              const isPickedWrong = phase === 'revealing' && selectedOption === option && lastOutcome !== null && !lastOutcome.isCorrect
              let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
              if (phase === 'revealing') {
                if (isCorrectOption) stateClassName = 'border-emerald-500 bg-emerald-500/5'
                else if (isPickedWrong) stateClassName = 'border-red-500 bg-red-500/5'
                else stateClassName = 'border-border opacity-40'
              }
              return (
                <button
                  key={option}
                  type="button"
                  disabled={phase !== 'question'}
                  onClick={() => resolveGuess(option)}
                  className={`rounded-2xl border-2 px-4 py-4 text-left text-sm font-medium text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${stateClassName}`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {phase === 'saving' && (
        <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
          Locking in your baseline…
        </p>
      )}

      {phase === 'result' && result !== null && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          <LivingBrainLogo size={56} />
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Baseline Locked In™</p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">Your Starting Point</h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Every day of your 21-Day Transformation Journey now measures real growth against this.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Baseline WPM</p>
              <p className="font-heading text-xl font-bold tabular-nums text-foreground">{result.trueBaselineWpm} WPM</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Comprehension</p>
              <p className="font-heading text-xl font-bold tabular-nums text-foreground">{result.accuracyPercent}%</p>
            </div>
          </div>

          <Button asChild size="lg" className="rounded-full">
            <Link href="/labs/quantum-speed-reading/journey/1">Begin Day 1 →</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
