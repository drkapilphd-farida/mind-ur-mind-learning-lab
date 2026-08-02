'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  ROUNDS_PER_SESSION,
  AFTERIMAGE_DURATION_MS,
  RETENTION_RATING_LABELS,
  PERFECT_SESSION_BONUS,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForRating,
  nextStreak,
  type GazeRound,
  type GazeCategorySelection,
  type RetentionRating,
} from '../afterImageGazingDataset'
import { GazeVisualDisplay } from './GazeVisualDisplay'

const TICK_MS = 100
const REVEAL_DURATION_MS = 2400

type RoundPhase = 'gazing' | 'afterimage' | 'reflection'

type AfterImageGazingCanvasProps = {
  categorySelection: GazeCategorySelection
  onComplete: (elapsedMs: number, clearCount: number, totalScore: number, bestStreak: number) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

// A purely decorative, GPU-composited countdown bar: rather than
// re-rendering a shrinking width every 100ms (which reads as slightly
// jerky), it commits one CSS transition from 100% to 0% across the
// whole duration, matching the brief's "smooth visual countdown timer"
// ask. The double rAF ensures the browser paints the starting 100%
// state before the transition to 0% is triggered, so the animation
// actually plays instead of snapping straight to empty. The parent
// forces a remount each phase via `key`, which is what makes this
// restart reliably every round.
function SmoothCountdownBar({
  durationMs,
  barClassName,
  prefersReducedMotion,
}: {
  durationMs: number
  barClassName: string
  prefersReducedMotion: boolean
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
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
      <div
        className={`h-full rounded-full ${barClassName}`}
        style={{
          width: collapsed ? '0%' : '100%',
          transition: prefersReducedMotion ? undefined : `width ${durationMs}ms linear`,
        }}
      />
    </div>
  )
}

// After-Image / Complementary Color Gazing™ (fourth Right Brain
// Activation exercise) — deliberately NOT built on
// useReadingRuntime/ReadingHeader: a gazing round has no word count to
// honestly dose a WPM-paced dwell time against, and there's no
// target-pace concept here. Instead this reuses the two genuinely
// generic shell atoms directly (ReadingLayout, ReadingProgressBar,
// ReadingStatTile), matching every sibling gamified exercise's own
// precedent. Unlike the other three Right Brain exercises there is no
// "correct answer" to reveal — the afterimage phase is a real optical
// phenomenon that varies person to person, so this canvas only ever
// scores what a learner honestly reports about their own perception,
// never a fabricated ground truth. There is also no lives/Game Over
// branch: every session runs its full ROUNDS_PER_SESSION and always
// ends in a genuine completion.
export function AfterImageGazingCanvas({ categorySelection, onComplete, onExitRequested }: AfterImageGazingCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rounds] = useState<readonly GazeRound[]>(() => buildSessionRounds(categorySelection))
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<RoundPhase>('gazing')
  const [gazeRemainingMs, setGazeRemainingMs] = useState(() => rounds[0]?.gazeDurationMs ?? 0)
  const [afterimageRemainingMs, setAfterimageRemainingMs] = useState(AFTERIMAGE_DURATION_MS)
  const [selectedRating, setSelectedRating] = useState<RetentionRating | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [clearCount, setClearCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)

  const currentRound: GazeRound | undefined = rounds[roundIndex]

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // Gazing countdown — hands off to the afterimage phase once the
  // steady-fixation window is over.
  useEffect(() => {
    if (phase !== 'gazing') return
    if (gazeRemainingMs <= 0) {
      setAfterimageRemainingMs(AFTERIMAGE_DURATION_MS)
      setPhase('afterimage')
      return
    }
    const timeout = setTimeout(() => setGazeRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, gazeRemainingMs])

  // Afterimage countdown — hands off to the self-paced reflection
  // question once the neutral-surface observation window is over.
  useEffect(() => {
    if (phase !== 'afterimage') return
    if (afterimageRemainingMs <= 0) {
      setPhase('reflection')
      return
    }
    const timeout = setTimeout(() => setAfterimageRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, afterimageRemainingMs])

  // Reflection is self-paced (no timer) — once a rating is picked, this
  // advances to the next round or finishes the session after a pause
  // long enough to read the educational reveal note.
  useEffect(() => {
    if (selectedRating === null) return
    const timeout = setTimeout(() => {
      const nextRound = roundIndex + 1
      if (nextRound >= ROUNDS_PER_SESSION) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          const perfectBonus = clearCount === ROUNDS_PER_SESSION ? PERFECT_SESSION_BONUS : 0
          onComplete(elapsedMsRef.current, clearCount, totalScore + perfectBonus, bestStreakThisSession)
        }
      } else {
        setRoundIndex(nextRound)
        setSelectedRating(null)
        setGazeRemainingMs(rounds[nextRound]?.gazeDurationMs ?? 0)
        setPhase('gazing')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRating])

  function handleRate(rating: RetentionRating): void {
    if (phase !== 'reflection' || selectedRating !== null) return
    const newStreak = nextStreak(streak, rating)
    const pointsEarned = computePointsForRating(rating, newStreak)
    setStreak(newStreak)
    setBestStreakThisSession((best) => Math.max(best, newStreak))
    if (rating === 'clear') setClearCount((count) => count + 1)
    setTotalScore((score) => score + pointsEarned)
    setSelectedRating(rating)
  }

  if (currentRound === undefined) {
    return (
      <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
        {null}
      </ReadingLayout>
    )
  }

  const attemptsSoFar = roundIndex + (phase === 'reflection' && selectedRating !== null ? 1 : 0)
  const clarityPercentSoFar = attemptsSoFar > 0 ? Math.round((clearCount / attemptsSoFar) * 100) : 0
  const progressPercent = Math.round((attemptsSoFar / ROUNDS_PER_SESSION) * 100)
  const multiplier = computeStreakMultiplier(streak)
  const pointsForSelected = selectedRating === null ? 0 : computePointsForRating(selectedRating, streak)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      {/* Scoped to this exercise's own content only (ReadingLayout itself
          is shared/locked, untouched) — a defensive clamp so nothing this
          canvas renders (glowing shapes, the neutral afterimage panel)
          can ever visually escape to the right on narrow mobile
          viewports. */}
      <div className="w-full overflow-x-hidden">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          After-Image / Complementary Color Gazing™
        </p>

        <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${ROUNDS_PER_SESSION}`} />
          <ReadingStatTile label="Score" value={String(totalScore)} />
          <ReadingStatTile label="Streak" value={String(streak)} />
          <ReadingStatTile label="Clarity" value={`${clarityPercentSoFar}%`} />
        </div>

        <div className="mt-4 w-full">
          <ReadingProgressBar progressPercent={progressPercent} />
        </div>

        <div className="mt-4 flex justify-center">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${getMultiplierBadgeClassName(multiplier)}`}
          >
            Streak Multiplier ×{multiplier}
          </span>
        </div>

        {phase === 'gazing' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">Fix your gaze on the shape — try not to blink.</p>
            <GazeVisualDisplay asset={currentRound.asset} />
            <div className="w-48">
              <SmoothCountdownBar
                key={`gaze-${roundIndex}`}
                durationMs={currentRound.gazeDurationMs}
                barClassName="bg-foreground"
                prefersReducedMotion={prefersReducedMotion}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{Math.ceil(gazeRemainingMs / 1000)}s remaining</p>
            </div>
          </div>
        )}

        {phase === 'afterimage' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">Keep looking at the same spot — notice anything lingering.</p>
            {/* Deliberately NOT theme-aware (unlike the rest of this
                canvas) — the afterimage effect depends on a genuinely
                neutral light surface, which a dark-mode background would
                defeat, so this panel always renders the same regardless
                of the app's current theme. */}
            <div
              className="flex size-56 items-center justify-center rounded-2xl border sm:size-64"
              style={{ backgroundColor: '#f4f4f5', borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <div className="size-3 rounded-full" style={{ backgroundColor: '#3f3f46' }} aria-hidden="true" />
            </div>
            <div className="w-48">
              <SmoothCountdownBar
                key={`afterimage-${roundIndex}`}
                durationMs={AFTERIMAGE_DURATION_MS}
                barClassName="bg-sky-500"
                prefersReducedMotion={prefersReducedMotion}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">
                {Math.ceil(afterimageRemainingMs / 1000)}s remaining
              </p>
            </div>
          </div>
        )}

        {phase === 'reflection' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-center text-sm text-muted-foreground">Did you notice an afterimage glow?</p>

            <div className="grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-3">
              {(Object.entries(RETENTION_RATING_LABELS) as [RetentionRating, string][]).map(([rating, label]) => {
                const isPicked = selectedRating === rating
                const stateClassName =
                  selectedRating === null
                    ? 'border-border hover:border-primary/40 hover:bg-accent/20'
                    : isPicked
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-border opacity-40'

                return (
                  <button
                    key={rating}
                    type="button"
                    disabled={selectedRating !== null}
                    onClick={() => handleRate(rating)}
                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${stateClassName}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {selectedRating !== null && (
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-emerald-600">+{pointsForSelected} points</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Many people notice a soft {currentRound.asset.complementaryLabel.toLowerCase()} glow here — the opposite of{' '}
                  {currentRound.asset.dominantColorLabel.toLowerCase()} on the color wheel.
                </p>
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
      </div>
    </ReadingLayout>
  )
}
