'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COUNTDOWN_STATES,
  COUNTDOWN_STEP_MS,
  QUESTIONS_PER_SET,
  RECALL_TIME_LIMIT_MS,
  TIMING_BONUS_WINDOW_MS,
  PERFECT_SESSION_BONUS,
  pickRandomReadingSet,
  buildChunkSequence,
  getStageDurationMs,
  getTotalWordCount,
  computeWpm,
  computeReadingPowerScore,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  type ChunkStage,
} from './readingSprintDataset'

const TICK_MS = 100
const REVEAL_DURATION_MS = 1200

export type ReadingSprintResult = {
  wpm: number
  accuracyPercent: number
  score: number
}

type ReadingSprintProps = {
  onComplete: (result: ReadingSprintResult) => void
}

type Phase = 'countdown' | 'reading' | 'question' | 'revealing' | 'results'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  wasFast: boolean
}

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = result[i]
    const atJ = result[j]
    if (atI === undefined || atJ === undefined) continue
    result[i] = atJ
    result[j] = atI
  }
  return result
}

// A depleting circular ring for one countdown tick — a real CSS
// transition from full to empty across the tick's own duration (the
// same double-rAF technique used for smooth countdowns elsewhere in
// this app), not a re-rendered width every 100ms. The parent forces a
// remount each tick via `key`, which is what makes it restart reliably.
function CountdownRing({ durationMs, children }: { durationMs: number; children: React.ReactNode }): React.JSX.Element {
  const [depleted, setDepleted] = useState(false)
  const secondFrameRef = useRef<number | null>(null)
  const size = 128
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
      <span className="absolute font-heading text-4xl font-bold tracking-tight text-foreground">{children}</span>
    </div>
  )
}

// A prominent, genuinely smooth countdown bar — a single CSS transition
// from full to empty, not a width re-rendered every 100ms — paired with
// a live numeric label so remaining time is always easy to notice.
function SmoothCountdownBar({
  durationMs,
  remainingMs,
  barClassName,
}: {
  durationMs: number
  remainingMs: number
  barClassName: string
}): React.JSX.Element {
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
    <div className="w-full max-w-[220px]">
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn('h-full rounded-full', barClassName)}
          style={{ width: collapsed ? '0%' : '100%', transition: `width ${durationMs}ms linear` }}
        />
      </div>
      <p className="mt-1.5 text-center text-xs font-semibold tabular-nums text-foreground">{(remainingMs / 1000).toFixed(1)}s</p>
    </div>
  )
}

// Reading Sprint™ — Phase 2 of the 2-minute assessment lead magnet.
// Rewritten to fix a genuine content-repetition issue: instead of
// cycling through several short, unrelated fragments per session, this
// picks exactly ONE real, complete passage at random (never repeating
// the immediately previous session's passage — see
// `pickRandomReadingSet`), flows it through a real chunking engine
// (word → phrase → sentence, per sentence, paced from real word
// counts), then asks that exact passage's own 2 pre-written
// comprehension questions — never a question about content the learner
// didn't actually just read. WPM and the blended score are both
// computed from real, measured values: real word count over the
// chunking engine's own real total duration, and real answer
// correctness. Presentational component: the only behavior it owns is
// calling `onComplete` once, from the results screen's own CTA.
export function ReadingSprint({ onComplete }: ReadingSprintProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdownIndex, setCountdownIndex] = useState(0)

  // The set is picked exactly once per mount, and every other piece of
  // initial state below derives from this SAME set (never a second
  // independent pick), so the very first chunk's duration always
  // matches the very first word actually about to be shown.
  const [selectedSet] = useState(() => pickRandomReadingSet())
  const [chunkStages] = useState<readonly ChunkStage[]>(() => buildChunkSequence(selectedSet.text))
  const [stageIndex, setStageIndex] = useState(0)
  const [stageRemainingMs, setStageRemainingMs] = useState(() => {
    const firstStage = chunkStages[0]
    return firstStage === undefined ? 0 : getStageDurationMs(firstStage)
  })

  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<readonly string[]>([])
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)

  const [streak, setStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const [resultForDisplay, setResultForDisplay] = useState<ReadingSprintResult | null>(null)
  const hasFinalizedRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    // Reset to true on every effect-mount, not just rely on the initial
    // useRef value — React Strict Mode's dev-only double-invoke
    // (mount → cleanup → mount again) runs the cleanup below once
    // before this component is really unmounted, which would otherwise
    // leave this permanently `false` and silently break every guarded
    // setTimeout callback for the rest of the component's real life.
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Countdown — 3 → 2 → 1 → GO!, then into the chunking engine.
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

  // The chunking engine — advances word → phrase → sentence for each
  // sentence in the passage, then hands off immediately to that
  // passage's own first comprehension question once every stage has
  // played (no arbitrary wall-clock timer, no unrelated content mixed
  // in).
  useEffect(() => {
    if (phase !== 'reading') return
    if (stageRemainingMs <= 0) {
      const nextStageIndex = stageIndex + 1
      if (nextStageIndex < chunkStages.length) {
        const nextStage = chunkStages[nextStageIndex]
        if (nextStage === undefined) return
        setStageIndex(nextStageIndex)
        setStageRemainingMs(getStageDurationMs(nextStage))
      } else {
        beginQuestion(0)
      }
      return
    }
    const timeout = setTimeout(() => setStageRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stageIndex, stageRemainingMs])

  // Recall — the 4 options appear the instant this phase starts
  // (immediate recall, no post-session quiz). Running out counts as a
  // miss exactly like a wrong tap.
  useEffect(() => {
    if (phase !== 'question') return
    if (recallRemainingMs <= 0) {
      handleTimeout()
      return
    }
    const timeout = setTimeout(() => setRecallRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recallRemainingMs])

  // Auto-advances to the second question or finishes the sprint once a
  // guess has been revealed.
  useEffect(() => {
    if (phase !== 'revealing') return
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      const nextQuestionIndex = questionIndex + 1
      if (nextQuestionIndex < QUESTIONS_PER_SET) {
        beginQuestion(nextQuestionIndex)
      } else {
        finalizeSession()
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function beginQuestion(index: number): void {
    const question = selectedSet.questions[index]
    if (question === undefined) return
    setQuestionIndex(index)
    setCurrentOptions(shuffle(question.options))
    setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
    setSelectedOption(null)
    setLastOutcome(null)
    setPhase('question')
  }

  function handleGuess(option: string): void {
    const question = selectedSet.questions[questionIndex]
    if (phase !== 'question' || question === undefined) return
    const reactionTimeMs = RECALL_TIME_LIMIT_MS - recallRemainingMs
    const correctOptionText = question.options[question.correctIndex]
    const isCorrect = option === correctOptionText
    setSelectedOption(option)
    setPhase('revealing')

    if (isCorrect) {
      const newStreak = streak + 1
      const pointsEarned = computePointsForCorrectMatch(newStreak, reactionTimeMs)
      const wasFast = reactionTimeMs <= TIMING_BONUS_WINDOW_MS
      setStreak(newStreak)
      setCorrectCount((count) => count + 1)
      setTotalScore((score) => score + pointsEarned)
      setLastOutcome({ isCorrect: true, pointsEarned, wasFast })
    } else {
      setStreak(0)
      setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
    }
  }

  function handleTimeout(): void {
    if (phase !== 'question') return
    setSelectedOption(null)
    setPhase('revealing')
    setStreak(0)
    setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
  }

  // Computes the final result exactly once and only DISPLAYS it —
  // `onComplete` itself fires only from the CTA button's own onClick
  // below (the results phase shows what happened; handing off to the
  // caller is a distinct, explicit user action, never automatic).
  function finalizeSession(): void {
    if (hasFinalizedRef.current) return
    hasFinalizedRef.current = true
    const totalReadingDurationMs = chunkStages.reduce((sum, stage) => sum + getStageDurationMs(stage), 0)
    const totalWordCount = getTotalWordCount(selectedSet.text)
    const wpm = computeWpm(totalWordCount, totalReadingDurationMs)
    const accuracyPercent = Math.round((correctCount / QUESTIONS_PER_SET) * 100)
    const perfectBonus = correctCount === QUESTIONS_PER_SET ? PERFECT_SESSION_BONUS : 0
    const score = computeReadingPowerScore(wpm, accuracyPercent)
    setResultForDisplay({ wpm, accuracyPercent, score })
    setTotalScore((current) => current + perfectBonus)
    setPhase('results')
  }

  const currentStage = chunkStages[stageIndex]
  const currentQuestion = selectedSet.questions[questionIndex]
  const multiplier = computeStreakMultiplier(streak)

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div key="countdown" exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Get ready</p>
              <CountdownRing key={countdownIndex} durationMs={COUNTDOWN_STEP_MS}>
                {COUNTDOWN_STATES[countdownIndex]}
              </CountdownRing>
            </motion.div>
          )}

          {phase === 'reading' && currentStage !== undefined && (
            <motion.div key="reading" exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-8">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{selectedSet.theme}</p>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`${stageIndex}-${currentStage.kind}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={cn(
                    'font-heading font-bold tracking-tight text-foreground',
                    currentStage.kind === 'word' && 'text-5xl sm:text-6xl',
                    currentStage.kind === 'phrase' && 'text-3xl sm:text-4xl',
                    currentStage.kind === 'sentence' && 'max-w-md text-xl leading-snug sm:text-2xl',
                  )}
                >
                  {currentStage.text}
                </motion.p>
              </AnimatePresence>

              <SmoothCountdownBar
                key={`stage-${stageIndex}`}
                durationMs={getStageDurationMs(currentStage)}
                remainingMs={stageRemainingMs}
                barClassName="bg-primary"
              />
            </motion.div>
          )}

          {(phase === 'question' || phase === 'revealing') && currentQuestion !== undefined && (
            <motion.div
              key={`question-${questionIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex w-full flex-col items-center gap-6"
            >
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Question {questionIndex + 1} of {QUESTIONS_PER_SET}
              </p>
              <p className="font-heading text-2xl font-bold tracking-tight text-foreground">{currentQuestion.question}</p>

              {phase === 'revealing' && lastOutcome !== null ? (
                <p className={cn('text-sm font-medium', lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground')}>
                  {lastOutcome.isCorrect
                    ? `Correct! +${lastOutcome.pointsEarned} points${lastOutcome.wasFast ? ' (fast bonus!)' : ''}`
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
                    if (isCorrectOption) stateClassName = 'border-emerald-500 bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]'
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

              <p className="text-xs font-medium tabular-nums text-muted-foreground">Streak ×{multiplier}</p>
            </motion.div>
          )}

          {phase === 'results' && resultForDisplay !== null && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex w-full flex-col items-center gap-8"
            >
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your reading profile</p>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Sprint Complete</h2>
                {correctCount === QUESTIONS_PER_SET && (
                  <p className="mt-2 text-sm font-semibold text-emerald-600">Flawless comprehension! +{PERFECT_SESSION_BONUS} bonus included.</p>
                )}
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <ResultTile label="Words / min" value={String(resultForDisplay.wpm)} />
                <ResultTile label="Accuracy" value={`${resultForDisplay.accuracyPercent}%`} />
                <ResultTile label="Reading Score" value={String(resultForDisplay.score)} />
                <ResultTile label="Total Points" value={String(totalScore)} />
              </div>

              <motion.button
                type="button"
                onClick={() => onComplete(resultForDisplay)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={cn(
                  'group flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-8 py-4',
                  'text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25',
                  'transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                Continue to Memory Test
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ResultTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card/60 px-3 py-5">
      <span className="font-heading text-2xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
