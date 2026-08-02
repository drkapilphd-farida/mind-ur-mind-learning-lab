'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  GRID_SIZE,
  SESSION_DURATION_MS,
  STIMULUS_ACTIVE_DURATION_MS,
  COUNTDOWN_STATES,
  COUNTDOWN_STEP_MS,
  DECOY_IGNORE_POINTS,
  pickRandomGapDurationMs,
  pickRandomCellIndex,
  pickStimulusKind,
  computeStreakMultiplier,
  computePointsForTargetHit,
  computeAttentionStabilityPercent,
  getAttentionLabel,
} from './focusChallengeDataset'

const TICK_MS = 100
const FEEDBACK_DURATION_MS = 350

export type FocusChallengeResult = {
  attentionStabilityPercent: number
  label: string
  totalScore: number
  bestStreak: number
}

type FocusChallengeProps = {
  onComplete: (result: FocusChallengeResult) => void
}

type Phase = 'countdown' | 'playing' | 'results'
type SubPhase = 'gap' | 'active' | 'feedback'
type StimulusKind = 'target' | 'decoy'
type CellVisualState = 'empty' | StimulusKind | 'correct' | 'wrong'

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

// A prominent, genuinely smooth countdown bar — one continuous CSS
// transition from full to empty across the whole 45-second session
// (mounted once, never remounted mid-session), not a width re-rendered
// every 100ms. The numeric label still reads from the real ticked state
// for accuracy.
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
    <div className="w-full">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn('h-full rounded-full', barClassName)}
          style={{ width: collapsed ? '0%' : '100%', transition: `width ${durationMs}ms linear` }}
        />
      </div>
      <p className="mt-1.5 text-center text-xs font-semibold tabular-nums text-muted-foreground">{Math.ceil(remainingMs / 1000)}s left</p>
    </div>
  )
}

function getCellBorderClassName(state: CellVisualState): string {
  if (state === 'correct') return 'border-emerald-500 bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]'
  if (state === 'wrong') return 'border-red-500 bg-red-500/5'
  if (state === 'target' || state === 'decoy') return 'border-primary/40'
  return 'border-border/60'
}

// Focus Challenge™ — Phase 4 (final) of the 2-minute assessment lead
// magnet. A classic go/no-go attention drill: exactly one cell in a 3×3
// grid is ever "live" at a time, showing either a genuine target (click
// it fast) or a decoy (leave it alone) for a fixed, fair window before
// it disappears — reaction speed and distraction filtering, both
// measured honestly from real clicks and real timeouts, never
// fabricated. Presentational component: the only behavior it owns is
// calling `onComplete` once, from the results screen's own CTA.
export function FocusChallenge({ onComplete }: FocusChallengeProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdownIndex, setCountdownIndex] = useState(0)

  const [sessionRemainingMs, setSessionRemainingMs] = useState(SESSION_DURATION_MS)
  const [subPhase, setSubPhase] = useState<SubPhase>('gap')
  const [subPhaseRemainingMs, setSubPhaseRemainingMs] = useState(() => pickRandomGapDurationMs())
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null)
  const [activeKind, setActiveKind] = useState<StimulusKind | null>(null)
  const [feedbackKind, setFeedbackKind] = useState<'correct' | 'wrong' | null>(null)

  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const [totalTargetsShown, setTotalTargetsShown] = useState(0)
  const [targetsHit, setTargetsHit] = useState(0)
  const [totalDecoysShown, setTotalDecoysShown] = useState(0)
  const [decoysIgnored, setDecoysIgnored] = useState(0)

  const [resultForDisplay, setResultForDisplay] = useState<FocusChallengeResult | null>(null)
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

  // Countdown — 3 → 2 → 1 → GO!, then into the live grid.
  useEffect(() => {
    if (phase !== 'countdown') return
    const timeout = setTimeout(() => {
      const nextIndex = countdownIndex + 1
      if (nextIndex >= COUNTDOWN_STATES.length) {
        setPhase('playing')
      } else {
        setCountdownIndex(nextIndex)
      }
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(timeout)
  }, [phase, countdownIndex])

  // The single ticking heartbeat for the whole 45-second drill — it
  // owns the authoritative session countdown AND the gap → active →
  // feedback → gap cycle for whichever single cell is currently live.
  // Every relevant piece of state is listed as a dependency, so each
  // tick's closure is guaranteed fresh (the same pattern proven safe
  // throughout this project's other timer-driven exercises).
  useEffect(() => {
    if (phase !== 'playing') return
    if (sessionRemainingMs <= 0) {
      finalizeSession()
      return
    }
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return
      setSessionRemainingMs(Math.max(0, sessionRemainingMs - TICK_MS))

      if (subPhaseRemainingMs > TICK_MS) {
        setSubPhaseRemainingMs(subPhaseRemainingMs - TICK_MS)
        return
      }

      if (subPhase === 'gap') {
        const cellIndex = pickRandomCellIndex()
        const kind = pickStimulusKind()
        setActiveCellIndex(cellIndex)
        setActiveKind(kind)
        setSubPhase('active')
        setSubPhaseRemainingMs(STIMULUS_ACTIVE_DURATION_MS)
        if (kind === 'target') setTotalTargetsShown(totalTargetsShown + 1)
        else setTotalDecoysShown(totalDecoysShown + 1)
        return
      }

      if (subPhase === 'active') {
        // Expired without a click.
        if (activeKind === 'target') {
          setStreak(0)
        } else if (activeKind === 'decoy') {
          setDecoysIgnored(decoysIgnored + 1)
          setTotalScore(totalScore + DECOY_IGNORE_POINTS)
          const newStreak = streak + 1
          setStreak(newStreak)
          setBestStreakThisSession(Math.max(bestStreakThisSession, newStreak))
        }
        setActiveCellIndex(null)
        setActiveKind(null)
        setSubPhase('gap')
        setSubPhaseRemainingMs(pickRandomGapDurationMs())
        return
      }

      // subPhase === 'feedback' — clear the flash and resume the cycle.
      setActiveCellIndex(null)
      setActiveKind(null)
      setFeedbackKind(null)
      setSubPhase('gap')
      setSubPhaseRemainingMs(pickRandomGapDurationMs())
    }, TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phase,
    sessionRemainingMs,
    subPhase,
    subPhaseRemainingMs,
    activeKind,
    streak,
    bestStreakThisSession,
    totalScore,
    decoysIgnored,
    totalTargetsShown,
    totalDecoysShown,
  ])

  function handleCellClick(cellIndex: number): void {
    if (subPhase !== 'active' || cellIndex !== activeCellIndex || activeKind === null) return
    const reactionTimeMs = STIMULUS_ACTIVE_DURATION_MS - subPhaseRemainingMs

    if (activeKind === 'target') {
      const newStreak = streak + 1
      const points = computePointsForTargetHit(newStreak, reactionTimeMs)
      setStreak(newStreak)
      setBestStreakThisSession(Math.max(bestStreakThisSession, newStreak))
      setTargetsHit(targetsHit + 1)
      setTotalScore(totalScore + points)
      setFeedbackKind('correct')
    } else {
      setStreak(0)
      setFeedbackKind('wrong')
    }
    setSubPhase('feedback')
    setSubPhaseRemainingMs(FEEDBACK_DURATION_MS)
  }

  // Computes the final result exactly once and only DISPLAYS it —
  // `onComplete` itself fires only from the CTA button's own onClick
  // below (the results phase shows what happened; handing off to the
  // caller is a distinct, explicit user action, never automatic).
  function finalizeSession(): void {
    if (hasFinalizedRef.current) return
    hasFinalizedRef.current = true
    const attentionStabilityPercent = computeAttentionStabilityPercent(targetsHit, totalTargetsShown, decoysIgnored, totalDecoysShown)
    setResultForDisplay({
      attentionStabilityPercent,
      label: getAttentionLabel(attentionStabilityPercent),
      totalScore,
      bestStreak: bestStreakThisSession,
    })
    setPhase('results')
  }

  function getCellVisualState(index: number): CellVisualState {
    if (activeCellIndex !== index) return 'empty'
    if (subPhase === 'feedback' && feedbackKind !== null) return feedbackKind
    if (subPhase === 'active' && activeKind !== null) return activeKind
    return 'empty'
  }

  const multiplier = computeStreakMultiplier(streak)

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div key="countdown" exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Get Ready • Focus Test</p>
              <CountdownRing key={countdownIndex} durationMs={COUNTDOWN_STEP_MS}>
                {COUNTDOWN_STATES[countdownIndex]}
              </CountdownRing>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-8">
              <div className="w-full">
                <div className="grid w-full grid-cols-2 gap-3 text-left">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Score</p>
                    <p className="font-heading text-lg font-bold text-foreground tabular-nums">{totalScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Streak</p>
                    <p className="font-heading text-lg font-bold text-foreground tabular-nums">×{multiplier}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <SmoothCountdownBar durationMs={SESSION_DURATION_MS} remainingMs={sessionRemainingMs} barClassName="bg-primary" />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">Tap the glowing dot. Ignore the ✕.</p>

              <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                {Array.from({ length: GRID_SIZE }, (_, index) => {
                  const visualState = getCellVisualState(index)
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCellClick(index)}
                      aria-label={`Grid cell ${index + 1}`}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-2xl border-2 transition-colors duration-150',
                        getCellBorderClassName(visualState),
                      )}
                    >
                      <AnimatePresence>
                        {visualState === 'target' && (
                          <motion.div
                            key="target"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="size-10 rounded-full bg-primary ring-8 ring-primary/20 sm:size-12"
                          />
                        )}
                        {visualState === 'decoy' && (
                          <motion.div
                            key="decoy"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                          >
                            <X className="size-8 text-red-500 sm:size-10" strokeWidth={3} aria-hidden="true" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )
                })}
              </div>
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
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your focus profile</p>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Focus Test Complete</h2>
                <p className="mt-3 text-sm font-semibold text-primary">
                  Attention Stability: {resultForDisplay.attentionStabilityPercent}% • {resultForDisplay.label}
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <ResultTile label="Attention Stability" value={`${resultForDisplay.attentionStabilityPercent}%`} />
                <ResultTile label="Best Streak" value={String(resultForDisplay.bestStreak)} />
                <ResultTile label="Total Points" value={String(resultForDisplay.totalScore)} />
                <ResultTile label="Focus Level" value={resultForDisplay.label} />
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
                Unlock My Mind Profile
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
      <span className="font-heading text-xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
