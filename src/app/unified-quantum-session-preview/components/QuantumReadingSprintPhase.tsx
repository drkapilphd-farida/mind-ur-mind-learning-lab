'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { playClickChime, playCorrectChime, playGentleMissChime } from './soundEngine'
import {
  pickRandomReadingSet,
  buildChunkSequence,
  getStageDurationMs,
  getTotalWordCount,
  computeWpm,
  computeReadingPowerScore,
  RECALL_TIME_LIMIT_MS,
  COUNTDOWN_STATES,
  COUNTDOWN_STEP_MS,
  type ReadingSet,
  type ChunkStage,
  type ReadingMCQ,
} from './quantumReadingSprintDataset'

const QUESTIONS_PER_SET = 2
const REVEAL_DURATION_MS = 1_200
const STAGE_TICK_MS = 100

type Phase = 'countdown' | 'reading' | 'question' | 'revealing'

export type QuantumReadingSprintResult = {
  wpm: number
  accuracyPercent: number
  score: number
  selectedSet: ReadingSet
}

type QuantumReadingSprintPhaseProps = {
  onComplete: (result: QuantumReadingSprintResult) => void
  // Auto-Pacing WPM Adjustment™ — additive, optional, defaults to exactly
  // today's fixed pace (1 = unchanged). >1 shortens every stage's display
  // duration proportionally (faster pace, higher effective WPM); <1
  // lengthens it. See quantum-journey/adaptivePacing.ts for how the
  // caller derives this from the previous session's real accuracy.
  speedMultiplier?: number
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as T
    copy[j] = temp as T
  }
  return copy
}

// A depleting circular ring for one countdown tick — own local copy per
// this project's established "each area owns its own copy" convention.
function CountdownRing({ durationMs, children }: { durationMs: number; children: React.ReactNode }): React.JSX.Element {
  const [depleted, setDepleted] = useState(false)
  const secondFrameRef = useRef<number | null>(null)
  const size = 112
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const firstFrame = requestAnimationFrame(() => {
      secondFrameRef.current = requestAnimationFrame(() => setDepleted(true))
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrameRef.current !== null) cancelAnimationFrame(secondFrameRef.current)
    }
  }, [])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-foreground/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-primary"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: depleted ? circumference : 0,
            transition: `stroke-dashoffset ${durationMs}ms linear`,
          }}
        />
      </svg>
      <span className="absolute font-heading text-3xl font-bold tracking-tight text-foreground">{children}</span>
    </div>
  )
}

function SmoothCountdownBar({ durationMs, remainingMs, barClassName }: { durationMs: number; remainingMs: number; barClassName: string }): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const secondFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const firstFrame = requestAnimationFrame(() => {
      secondFrameRef.current = requestAnimationFrame(() => setCollapsed(true))
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrameRef.current !== null) cancelAnimationFrame(secondFrameRef.current)
    }
  }, [])

  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn('h-full rounded-full', barClassName)}
          style={{ width: collapsed ? '0%' : '100%', transition: `width ${durationMs}ms linear` }}
        />
      </div>
      <p className="mt-1.5 text-center text-xs font-semibold tabular-nums text-muted-foreground">{(remainingMs / 1000).toFixed(1)}s</p>
    </div>
  )
}

// Level 3 — Quantum Speed Reading Sprint: countdown → progressive
// word→phrase→sentence chunked reading → 2 live comprehension MCQs. A
// persistent HUD shows real-time WPM (derived from words actually shown
// so far ÷ elapsed reading time so far — never inflated by counting the
// same sentence's word/phrase/sentence reveal stages more than once) and
// live accuracy as each question resolves. Reports once, via onComplete,
// carrying the selected passage forward so Level 4 can ask its own
// separate retention questions about the same content.
export function QuantumReadingSprintPhase({ onComplete, speedMultiplier = 1 }: QuantumReadingSprintPhaseProps): React.JSX.Element {
  const [selectedSet] = useState<ReadingSet>(() => pickRandomReadingSet())
  const [chunkStages] = useState<readonly ChunkStage[]>(() => buildChunkSequence(selectedSet.text))

  // Scales the dataset's own fixed per-stage duration by the auto-paced
  // multiplier — every internal duration calculation below goes through
  // this, never the raw getStageDurationMs, so the pace actually run and
  // the WPM computed from it can never drift apart.
  function adjustedStageDurationMs(stage: ChunkStage): number {
    return Math.round(getStageDurationMs(stage) / speedMultiplier)
  }

  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdownIndex, setCountdownIndex] = useState(0)

  const [stageIndex, setStageIndex] = useState(0)
  const [stageRemainingMs, setStageRemainingMs] = useState(() => (chunkStages[0] !== undefined ? adjustedStageDurationMs(chunkStages[0]) : 0))

  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<readonly string[]>([])
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<{ isCorrect: boolean } | null>(null)

  const [answeredCount, setAnsweredCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const isMountedRef = useRef(true)
  const hasFinalizedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Countdown — 3 → 2 → 1 → GO!, then into the reading phase.
  useEffect(() => {
    if (phase !== 'countdown') return
    const timeout = setTimeout(() => {
      const nextIndex = countdownIndex + 1
      if (nextIndex >= COUNTDOWN_STATES.length) {
        setPhase('reading')
      } else {
        setCountdownIndex(nextIndex)
      }
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(timeout)
  }, [phase, countdownIndex])

  // Reading phase — advances through the chunk sequence; the last stage
  // hands off directly into the first comprehension question.
  useEffect(() => {
    if (phase !== 'reading') return
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      if (stageRemainingMs > STAGE_TICK_MS) {
        setStageRemainingMs(stageRemainingMs - STAGE_TICK_MS)
        return
      }
      const nextIndex = stageIndex + 1
      if (nextIndex >= chunkStages.length) {
        beginQuestion(0)
        return
      }
      const nextStage = chunkStages[nextIndex]
      if (nextStage === undefined) return
      setStageIndex(nextIndex)
      setStageRemainingMs(adjustedStageDurationMs(nextStage))
    }, STAGE_TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stageIndex, stageRemainingMs, chunkStages])

  // Recall countdown — while a question is live, ticks down and times
  // out into a miss if the user never answers.
  useEffect(() => {
    if (phase !== 'question') return
    if (recallRemainingMs <= 0) {
      resolveGuess(null)
      return
    }
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      setRecallRemainingMs(Math.max(0, recallRemainingMs - 100))
    }, 100)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recallRemainingMs])

  function beginQuestion(index: number): void {
    const question = selectedSet.comprehensionQuestions[index]
    if (question === undefined) return
    setQuestionIndex(index)
    setCurrentOptions(shuffle(question.options))
    setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
    setSelectedOption(null)
    setPhase('question')
  }

  function resolveGuess(option: string | null): void {
    const question = selectedSet.comprehensionQuestions[questionIndex]
    if (question === undefined) return
    const correctOptionText = question.options[question.correctIndex]
    const isCorrect = option !== null && option === correctOptionText

    setAnsweredCount((count) => count + 1)
    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      playCorrectChime()
    } else {
      playGentleMissChime()
    }

    setLastOutcome({ isCorrect })
    setSelectedOption(option)
    setPhase('revealing')

    setTimeout(() => {
      if (!isMountedRef.current) return
      const nextIndex = questionIndex + 1
      if (nextIndex >= QUESTIONS_PER_SET) {
        finalizeSession(isCorrect)
      } else {
        beginQuestion(nextIndex)
      }
    }, REVEAL_DURATION_MS)
  }

  function handleGuess(option: string): void {
    if (phase !== 'question') return
    playClickChime()
    resolveGuess(option)
  }

  function finalizeSession(lastAnswerCorrect: boolean): void {
    if (hasFinalizedRef.current) return
    hasFinalizedRef.current = true
    const totalReadingDurationMs = chunkStages.reduce((sum, stage) => sum + adjustedStageDurationMs(stage), 0)
    const wpm = computeWpm(getTotalWordCount(selectedSet.text), totalReadingDurationMs)
    const finalCorrectCount = lastAnswerCorrect ? correctCount + 1 : correctCount
    const accuracyPercent = Math.round((finalCorrectCount / QUESTIONS_PER_SET) * 100)
    const score = computeReadingPowerScore(wpm, accuracyPercent)
    onComplete({ wpm, accuracyPercent, score, selectedSet })
  }

  const currentStage = chunkStages[stageIndex]
  const currentQuestion: ReadingMCQ | undefined = selectedSet.comprehensionQuestions[questionIndex]

  // Live WPM — the chunking engine now partitions the passage into
  // non-overlapping stages (RSVP words → 2-word → 3-word → phrase, each
  // covering genuinely NEW text), so every completed stage's words count
  // exactly once — no kind filter needed to avoid double-counting the
  // same content shown at increasing scope, unlike the old per-sentence
  // word→phrase→sentence design. Divided by the real elapsed time across
  // every completed stage plus progress into the current one.
  const stagesBeforeCurrent = chunkStages.slice(0, stageIndex)
  const elapsedFromCompletedStages = stagesBeforeCurrent.reduce((sum, stage) => sum + adjustedStageDurationMs(stage), 0)
  const currentStageElapsedMs = currentStage !== undefined ? adjustedStageDurationMs(currentStage) - stageRemainingMs : 0
  const totalElapsedReadingMs = elapsedFromCompletedStages + Math.max(0, currentStageElapsedMs)
  const wordsShownSoFar = stagesBeforeCurrent.reduce((sum, stage) => sum + stage.wordCount, 0)
  const liveWpm = wordsShownSoFar > 0 ? computeWpm(wordsShownSoFar, totalElapsedReadingMs) : null
  const liveAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Quantum Speed Reading Sprint</p>

      {phase !== 'countdown' && (
        <div className="flex w-full max-w-xs items-center justify-center gap-6 rounded-2xl border border-border/60 bg-card/60 px-5 py-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Live WPM</span>
            <span className="font-heading text-lg font-bold tabular-nums text-foreground">{liveWpm ?? '—'}</span>
          </div>
          <div className="h-8 w-px bg-border" aria-hidden="true" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Accuracy</span>
            <span className="font-heading text-lg font-bold tabular-nums text-foreground">
              {liveAccuracy !== null ? `${liveAccuracy}%` : '—'}
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'countdown' && (
          <motion.div key="countdown" exit={{ opacity: 0 }}>
            <CountdownRing key={countdownIndex} durationMs={COUNTDOWN_STEP_MS}>
              {COUNTDOWN_STATES[countdownIndex]}
            </CountdownRing>
          </motion.div>
        )}

        {phase === 'reading' && currentStage !== undefined && (
          <motion.div key="reading" exit={{ opacity: 0 }} className="flex w-full max-w-md flex-col items-center gap-4">
            <div className="flex min-h-32 w-full items-center justify-center rounded-2xl border border-border/60 bg-card/60 px-6 py-8">
              <p className="font-heading text-2xl font-bold tracking-tight text-foreground">{currentStage.text}</p>
            </div>
          </motion.div>
        )}

        {(phase === 'question' || phase === 'revealing') && currentQuestion !== undefined && (
          <motion.div
            key={`question-${questionIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex w-full max-w-md flex-col items-center gap-6"
          >
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Question {questionIndex + 1} of {QUESTIONS_PER_SET}
            </p>
            <p className="font-heading text-xl font-bold tracking-tight text-foreground">{currentQuestion.question}</p>

            {phase === 'revealing' && lastOutcome !== null ? (
              <p className={cn('text-sm font-medium', lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground')}>
                {lastOutcome.isCorrect
                  ? 'Correct!'
                  : `Not quite — it was "${currentQuestion.options[currentQuestion.correctIndex]}".`}
              </p>
            ) : (
              <SmoothCountdownBar durationMs={RECALL_TIME_LIMIT_MS} remainingMs={recallRemainingMs} barClassName="bg-red-500" />
            )}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {currentOptions.map((option) => {
                const correctOptionText = currentQuestion.options[currentQuestion.correctIndex]
                const isCorrectOption = phase === 'revealing' && option === correctOptionText
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
                    onClick={() => handleGuess(option)}
                    className={cn(
                      'rounded-2xl border-2 px-4 py-4 text-left text-sm font-medium text-foreground transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      stateClassName,
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
