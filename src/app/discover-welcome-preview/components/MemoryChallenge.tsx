'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Star,
  Heart,
  Cloud,
  Sun,
  Moon,
  Zap,
  Anchor,
  Feather,
  Gem,
  Flame,
  Leaf,
  Snowflake,
  Compass,
  Key,
  Shield,
  Rocket,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  COUNTDOWN_STATES,
  COUNTDOWN_STEP_MS,
  RECALL_TIME_LIMIT_MS,
  TIMING_BONUS_WINDOW_MS,
  buildSessionRounds,
  getDisplayDurationMs,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getMemoryEfficiencyLabel,
  type MemoryRound,
} from './memoryChallengeDataset'

const TICK_MS = 100
const REVEAL_DURATION_MS = 1000

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Star, Heart, Cloud, Sun, Moon, Zap, Anchor, Feather,
  Gem, Flame, Leaf, Snowflake, Compass, Key, Shield, Rocket,
}

export type MemoryChallengeResult = {
  efficiencyPercent: number
  correctCount: number
  totalRounds: number
  bestStreak: number
  totalScore: number
  label: string
}

type MemoryChallengeProps = {
  onComplete: (result: MemoryChallengeResult) => void
}

type Phase = 'countdown' | 'display' | 'recall' | 'revealing' | 'results'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  wasFast: boolean
}

// A depleting circular ring for one countdown tick — a real CSS
// transition from full to empty across the tick's own duration, kept as
// its own local copy per this project's established "each area owns its
// own copy" convention.
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
// from full to empty across the whole duration (the double-rAF ensures
// the browser paints the starting "full" state before the transition to
// empty is triggered, so it visibly animates rather than snapping),
// instead of a width re-rendered every 100ms. Thicker and paired with a
// live numeric label so the remaining time is always easy to notice, per
// this rewrite's own explicit "make the timer prominent" brief. The
// parent forces a remount each phase via `key`, which is what makes this
// restart reliably every round.
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
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn('h-full rounded-full', barClassName)}
          style={{ width: collapsed ? '0%' : '100%', transition: `width ${durationMs}ms linear` }}
        />
      </div>
      <p className="mt-1.5 text-center text-xs font-semibold tabular-nums text-foreground">{(remainingMs / 1000).toFixed(1)}s</p>
    </div>
  )
}

function DisplayItem({ round }: { round: MemoryRound }): React.JSX.Element {
  if (round.type === 'number') {
    return (
      <p className="font-heading text-6xl font-bold tracking-widest text-foreground tabular-nums sm:text-7xl">
        {round.displayItems[0]}
      </p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      {round.displayItems.map((item) => (
        <div
          key={item}
          className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/60 bg-card/60 sm:size-28"
        >
          {round.type === 'icon' ? (
            (() => {
              const Icon = ICON_COMPONENTS[item]
              return Icon !== undefined ? <Icon className="size-9 text-primary" aria-hidden="true" /> : null
            })()
          ) : (
            <span className="text-sm font-bold tracking-tight text-foreground">{item}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function OptionButton({
  option,
  round,
  disabled,
  onSelect,
  stateClassName,
}: {
  option: string
  round: MemoryRound
  disabled: boolean
  onSelect: () => void
  stateClassName: string
}): React.JSX.Element {
  const Icon = round.type === 'icon' ? ICON_COMPONENTS[option] : undefined
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-semibold text-foreground transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        stateClassName,
      )}
    >
      {Icon !== undefined && <Icon className="size-5" aria-hidden="true" />}
      {option}
    </button>
  )
}

// Memory Challenge™ — Phase 3 of the 2-minute assessment lead magnet.
// Exactly 3 rounds, one per category, always in the same fixed order
// (Visual Memory Test → Digit Span Memory → Word Recall Test) — a
// deliberate clarity rewrite: an earlier 6-round version randomly mixed
// round types together, which tested correctly but left a first-time
// user with no idea what kind of round was coming or how many
// remained. Every round still runs the same real phases (display →
// recall → reveal), now with a persistent category header, an explicit
// "what to do" instruction above the memorization box, and a genuinely
// smooth, prominent countdown bar for both the display and recall
// windows. Presentational component: the only behavior it owns is
// calling `onComplete` once, from the results screen's own CTA.
export function MemoryChallenge({ onComplete }: MemoryChallengeProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdownIndex, setCountdownIndex] = useState(0)

  const [sessionRounds] = useState<readonly MemoryRound[]>(() => buildSessionRounds())
  const [roundIndex, setRoundIndex] = useState(0)
  const [displayRemainingMs, setDisplayRemainingMs] = useState(() => {
    const firstRound = sessionRounds[0]
    return firstRound === undefined ? 0 : getDisplayDurationMs(firstRound)
  })
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)

  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

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

  // Countdown — 3 → 2 → 1 → GO!, then into the first round's display.
  useEffect(() => {
    if (phase !== 'countdown') return
    const timeout = setTimeout(() => {
      const nextIndex = countdownIndex + 1
      if (nextIndex >= COUNTDOWN_STATES.length) {
        setPhase('display')
      } else {
        setCountdownIndex(nextIndex)
      }
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(timeout)
  }, [phase, countdownIndex])

  // Display — the round's content holds on screen for a duration scaled
  // to its own content (digit count for number rounds, a fixed window
  // for icon/word rounds), then hands off to the timed recall phase.
  useEffect(() => {
    if (phase !== 'display') return
    if (displayRemainingMs <= 0) {
      setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
      setPhase('recall')
      return
    }
    const timeout = setTimeout(() => setDisplayRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, displayRemainingMs])

  // Recall — the 4 options appear the instant this phase starts
  // (immediate recall, no post-session quiz). Running out counts as a
  // miss exactly like a wrong tap.
  useEffect(() => {
    if (phase !== 'recall') return
    if (recallRemainingMs <= 0) {
      handleTimeout()
      return
    }
    const timeout = setTimeout(() => setRecallRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recallRemainingMs])

  // Auto-advances to the next round or finishes the sprint once a guess
  // has been revealed.
  useEffect(() => {
    if (phase !== 'revealing') return
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      const nextRoundIndex = roundIndex + 1
      if (nextRoundIndex >= sessionRounds.length) {
        finalizeSession()
      } else {
        const nextRound = sessionRounds[nextRoundIndex]
        if (nextRound === undefined) return
        setRoundIndex(nextRoundIndex)
        setSelectedAnswer(null)
        setLastOutcome(null)
        setDisplayRemainingMs(getDisplayDurationMs(nextRound))
        setPhase('display')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleGuess(option: string): void {
    const currentRound = sessionRounds[roundIndex]
    if (phase !== 'recall' || currentRound === undefined) return
    const reactionTimeMs = RECALL_TIME_LIMIT_MS - recallRemainingMs
    const isCorrect = option === currentRound.correctAnswer
    setSelectedAnswer(option)
    setPhase('revealing')

    if (isCorrect) {
      const newStreak = streak + 1
      const pointsEarned = computePointsForCorrectMatch(newStreak, reactionTimeMs)
      const wasFast = reactionTimeMs <= TIMING_BONUS_WINDOW_MS
      setStreak(newStreak)
      setBestStreakThisSession((best) => Math.max(best, newStreak))
      setCorrectCount((count) => count + 1)
      setTotalScore((score) => score + pointsEarned)
      setLastOutcome({ isCorrect: true, pointsEarned, wasFast })
    } else {
      setStreak(0)
      setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
    }
  }

  function handleTimeout(): void {
    if (phase !== 'recall') return
    setSelectedAnswer(null)
    setPhase('revealing')
    setStreak(0)
    setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
  }

  const [resultForDisplay, setResultForDisplay] = useState<MemoryChallengeResult | null>(null)

  // Computes the final result exactly once and only DISPLAYS it —
  // `onComplete` itself fires only from the CTA button's own onClick
  // below, matching Reading Sprint's established convention (the
  // results phase shows what happened; handing off to the caller is a
  // distinct, explicit user action, never automatic).
  function finalizeSession(): void {
    if (hasFinalizedRef.current) return
    hasFinalizedRef.current = true
    const efficiencyPercent = Math.round((correctCount / sessionRounds.length) * 100)
    setResultForDisplay({
      efficiencyPercent,
      correctCount,
      totalRounds: sessionRounds.length,
      bestStreak: bestStreakThisSession,
      totalScore,
      label: getMemoryEfficiencyLabel(efficiencyPercent),
    })
    setPhase('results')
  }

  const currentRound = sessionRounds[roundIndex]
  const multiplier = computeStreakMultiplier(streak)

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div key="countdown" exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Get Ready • Memory Test</p>
              <CountdownRing key={countdownIndex} durationMs={COUNTDOWN_STEP_MS}>
                {COUNTDOWN_STATES[countdownIndex]}
              </CountdownRing>
            </motion.div>
          )}

          {phase !== 'countdown' && phase !== 'results' && currentRound !== undefined && (
            <motion.div key="round" exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-6">
              {/* Persistent category header — always visible across
                  display/recall/reveal, so the learner always knows
                  which of the 3 tests is running and how many remain. */}
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Round {roundIndex + 1} of {sessionRounds.length}
                </p>
                <p className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">{currentRound.categoryLabel}</p>
              </div>

              {/* A smooth crossfade between the memorization box and the
                  multiple-choice grid — never an abrupt cut. */}
              <AnimatePresence mode="wait">
                {phase === 'display' && (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col items-center gap-6"
                  >
                    <p className="max-w-xs text-sm text-muted-foreground">{currentRound.instructionText}</p>
                    <motion.div
                      key={`item-${currentRound.id}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <DisplayItem round={currentRound} />
                    </motion.div>
                    <SmoothCountdownBar
                      key={`display-bar-${currentRound.id}`}
                      durationMs={getDisplayDurationMs(currentRound)}
                      remainingMs={displayRemainingMs}
                      barClassName="bg-primary"
                    />
                  </motion.div>
                )}

                {(phase === 'recall' || phase === 'revealing') && (
                  <motion.div
                    key="recall"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex w-full flex-col items-center gap-6"
                  >
                    {phase === 'revealing' && lastOutcome !== null ? (
                      <p className={cn('text-sm font-medium', lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {lastOutcome.isCorrect
                          ? `Correct! +${lastOutcome.pointsEarned} points${lastOutcome.wasFast ? ' (fast bonus!)' : ''}`
                          : `Not quite — it was ${currentRound.correctAnswer}.`}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-muted-foreground">{currentRound.prompt}</p>
                        <SmoothCountdownBar
                          key={`recall-bar-${currentRound.id}`}
                          durationMs={RECALL_TIME_LIMIT_MS}
                          remainingMs={recallRemainingMs}
                          barClassName="bg-red-500"
                        />
                      </div>
                    )}

                    <div className="grid w-full grid-cols-2 gap-3">
                      {currentRound.options.map((option) => {
                        const isCorrectOption = phase === 'revealing' && option === currentRound.correctAnswer
                        const isPickedWrong =
                          phase === 'revealing' && selectedAnswer === option && lastOutcome !== null && !lastOutcome.isCorrect
                        let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
                        if (phase === 'revealing') {
                          if (isCorrectOption) stateClassName = 'border-emerald-500 bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]'
                          else if (isPickedWrong) stateClassName = 'border-red-500 bg-red-500/5'
                          else stateClassName = 'border-border opacity-40'
                        }
                        return (
                          <OptionButton
                            key={option}
                            option={option}
                            round={currentRound}
                            disabled={phase !== 'recall'}
                            onSelect={() => handleGuess(option)}
                            stateClassName={stateClassName}
                          />
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your memory profile</p>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Memory Test Complete</h2>
                <p className="mt-3 text-sm font-semibold text-primary">{resultForDisplay.label}</p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <ResultTile label="Memory Efficiency" value={`${resultForDisplay.efficiencyPercent}%`} />
                <ResultTile label="Correct" value={`${resultForDisplay.correctCount} / ${resultForDisplay.totalRounds}`} />
                <ResultTile label="Best Streak" value={String(resultForDisplay.bestStreak)} />
                <ResultTile label="Total Points" value={String(resultForDisplay.totalScore)} />
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
                Continue to Focus Test
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
