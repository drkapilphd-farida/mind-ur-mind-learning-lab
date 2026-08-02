'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  ROUNDS_PER_SESSION,
  PERFECT_SESSION_BONUS,
  TIMING_BONUS_WINDOW_MS,
  MAX_LIVES,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  type EssenceRound,
} from '../pictorialEssenceSprintDataset'
import { EssenceIconDisplay } from './EssenceIconDisplay'

const TICK_MS = 100
// Ultra-fast flash (0.5-0.7s window), unchanged from the exercise's own
// original spec.
const FLASH_DURATION_MS = 600
// Arcade Hard Mode — reveal pacing and the recall window both tightened
// for a faster, more intense loop: the recall countdown in particular
// drops from a 5s window down to the task's own required 1.5s.
const REVEAL_DURATION_MS = 700
const RECALL_TIME_LIMIT_MS = 1500

type RoundPhase = 'flashing' | 'recall' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  wasFast: boolean
}

type PictorialEssenceSprintCanvasProps = {
  onComplete: (elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number, fastestReactionMs: number | null) => void
  onGameOver: (elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number, fastestReactionMs: number | null) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

function LivesRow({ livesRemaining }: { livesRemaining: number }): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label={`${livesRemaining} of ${MAX_LIVES} lives remaining`}>
      {Array.from({ length: MAX_LIVES }, (_, index) => {
        const isAlive = index < livesRemaining
        return (
          <Heart
            key={index}
            className={isAlive ? 'size-5 text-red-500' : 'size-5 text-muted-foreground/25'}
            fill={isAlive ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

// High-Speed Pictorial Essence Sprint™ (Arcade Hard Mode) — deliberately
// NOT built on useReadingRuntime/ReadingHeader: a flashed themed icon has
// no word count to honestly dose a WPM-paced dwell time against, and
// there's no target-pace concept for a pure essence-recall game. Instead
// this reuses the two genuinely generic shell atoms directly
// (ReadingLayout, ReadingProgressBar, ReadingStatTile) and owns its own
// minimal 100ms tick for three independent timers: the overall session
// stopwatch, the ultra-fast flash countdown, and the now much tighter
// 1.5s recall time limit (which also doubles as the reaction-time clock
// the timing bonus is computed from). The 3-lives system is this
// upgrade's own addition: a wrong click or a recall timeout costs a
// life, ending the sprint early (Game Over) once all 3 are gone.
export function PictorialEssenceSprintCanvas({ onComplete, onGameOver, onExitRequested }: PictorialEssenceSprintCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rounds] = useState<readonly EssenceRound[]>(() => buildSessionRounds())
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<RoundPhase>('flashing')
  const [flashRemainingMs, setFlashRemainingMs] = useState(FLASH_DURATION_MS)
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [livesRemaining, setLivesRemaining] = useState(MAX_LIVES)
  const [fastestReactionMs, setFastestReactionMs] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)

  const currentRound: EssenceRound | undefined = rounds[roundIndex]

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // The ultra-fast flash countdown — ticks down only while `phase ===
  // 'flashing'`, then hands off to the time-limited recall phase.
  useEffect(() => {
    if (phase !== 'flashing') return
    if (flashRemainingMs <= 0) {
      setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
      setPhase('recall')
      return
    }
    const timeout = setTimeout(() => setFlashRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, flashRemainingMs])

  // The arcade-tight 1.5s recall window — running out counts as a miss
  // exactly like a wrong click (streak resets, a life is lost, the real
  // essence is revealed). This same countdown also doubles as the
  // reaction-time clock the timing bonus is computed from.
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

  // Auto-advances to the next round, finishes the sprint, or ends it in
  // a Game Over, once a guess has been revealed. Depends only on `phase`,
  // matching the same established pattern every sibling gamified
  // exercise's own reveal-advance effect uses — correctCount/totalScore/
  // bestStreakThisSession/fastestReactionMs/livesRemaining/roundIndex are
  // all stable for the whole reveal window, so reading them directly
  // here is accurate, not stale; only elapsedMs keeps ticking
  // independently during the reveal, which is why it's read via a ref
  // instead. Lives are checked BEFORE the round-completion check so that
  // losing the last life on the final round still honestly reads as
  // Game Over, not a clean finish.
  useEffect(() => {
    if (phase !== 'revealing') return
    const timeout = setTimeout(() => {
      if (livesRemaining <= 0) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onGameOver(elapsedMsRef.current, correctCount, totalScore, bestStreakThisSession, fastestReactionMs)
        }
        return
      }

      const nextRound = roundIndex + 1
      if (nextRound >= ROUNDS_PER_SESSION) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          const perfectBonus = correctCount === ROUNDS_PER_SESSION ? PERFECT_SESSION_BONUS : 0
          onComplete(elapsedMsRef.current, correctCount, totalScore + perfectBonus, bestStreakThisSession, fastestReactionMs)
        }
      } else {
        setRoundIndex(nextRound)
        setSelectedOptionId(null)
        setLastOutcome(null)
        setFlashRemainingMs(FLASH_DURATION_MS)
        setPhase('flashing')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleGuess(optionId: string): void {
    if (phase !== 'recall' || currentRound === undefined) return
    const reactionTimeMs = RECALL_TIME_LIMIT_MS - recallRemainingMs
    const isCorrect = optionId === currentRound.correctOptionId
    setSelectedOptionId(optionId)
    setPhase('revealing')

    if (isCorrect) {
      const newStreak = streak + 1
      const pointsEarned = computePointsForCorrectMatch(newStreak, reactionTimeMs)
      const wasFast = reactionTimeMs <= TIMING_BONUS_WINDOW_MS
      setStreak(newStreak)
      setBestStreakThisSession((best) => Math.max(best, newStreak))
      setCorrectCount((count) => count + 1)
      setTotalScore((score) => score + pointsEarned)
      setFastestReactionMs((best) => (best === null ? reactionTimeMs : Math.min(best, reactionTimeMs)))
      setLastOutcome({ isCorrect: true, pointsEarned, wasFast })
    } else {
      setStreak(0)
      setLivesRemaining((lives) => Math.max(0, lives - 1))
      setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
    }
  }

  function handleTimeout(): void {
    if (phase !== 'recall') return
    setSelectedOptionId(null)
    setPhase('revealing')
    setStreak(0)
    setLivesRemaining((lives) => Math.max(0, lives - 1))
    setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
  }

  if (currentRound === undefined) {
    return (
      <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
        {null}
      </ReadingLayout>
    )
  }

  const attemptsSoFar = roundIndex + (phase === 'revealing' ? 1 : 0)
  const accuracySoFar = attemptsSoFar > 0 ? Math.round((correctCount / attemptsSoFar) * 100) : 0
  const progressPercent = Math.round((attemptsSoFar / ROUNDS_PER_SESSION) * 100)
  const multiplier = computeStreakMultiplier(streak)
  const flashRemainingSeconds = (flashRemainingMs / 1000).toFixed(1)
  const recallRemainingSeconds = (recallRemainingMs / 1000).toFixed(1)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      {/* Scoped to this exercise's own content only (ReadingLayout itself
          is shared/locked, untouched) — a defensive clamp so nothing this
          canvas renders (glow effects, transformed option cards, long
          theme labels) can ever visually escape to the right on narrow
          mobile viewports. */}
      <div className="w-full overflow-x-hidden">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">High-Speed Pictorial Essence Sprint™</p>

        <div className="mt-3 flex justify-center">
          <LivesRow livesRemaining={livesRemaining} />
        </div>

        <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${ROUNDS_PER_SESSION}`} />
          <ReadingStatTile label="Score" value={String(totalScore)} />
          <ReadingStatTile label="Streak" value={String(streak)} />
          <ReadingStatTile label="Accuracy" value={`${accuracySoFar}%`} />
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

        {phase === 'flashing' ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <EssenceIconDisplay iconId={currentRound.target.iconId} color={currentRound.target.color} size="large" />
            <div className="w-40">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full bg-foreground ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                  style={{ width: `${(flashRemainingMs / FLASH_DURATION_MS) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{flashRemainingSeconds}s</p>
            </div>
            <p className="text-sm text-muted-foreground">Feel the essence...</p>
          </div>
        ) : (
          <>
            {phase === 'revealing' && lastOutcome !== null ? (
              <p className={`mt-6 text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {lastOutcome.isCorrect
                  ? `Correct! +${lastOutcome.pointsEarned} points${lastOutcome.wasFast ? ' (fast bonus!)' : ''}`
                  : `Not quite — it was ${currentRound.target.label}.`}
              </p>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-center text-sm text-muted-foreground">Which one is the EXACT match?</p>
                <div className="w-32">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full bg-red-500 ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                      style={{ width: `${(recallRemainingMs / RECALL_TIME_LIMIT_MS) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[10px] text-muted-foreground tabular-nums">{recallRemainingSeconds}s to answer</p>
                </div>
              </div>
            )}

            <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-2 gap-4">
              {currentRound.options.map((option) => {
                const isCorrectOption = phase === 'revealing' && option.optionId === currentRound.correctOptionId
                const isPickedWrong =
                  phase === 'revealing' && selectedOptionId === option.optionId && lastOutcome !== null && !lastOutcome.isCorrect

                let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
                if (phase === 'revealing') {
                  if (isCorrectOption) {
                    // An inset glow, not an outward-blurring one — a
                    // box-shadow isn't part of an element's layout box, so
                    // an outward blur can visually bleed past this card's
                    // own rounded border (and toward its neighbor / the
                    // viewport edge on narrow phones) without ever
                    // triggering a measurable scrollbar. Inset keeps the
                    // celebratory highlight strictly inside the card.
                    stateClassName = `border-emerald-500/70 bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)] ${prefersReducedMotion ? '' : 'scale-105'}`
                  } else if (isPickedWrong) {
                    stateClassName = `border-red-500/60 bg-red-500/10 ${prefersReducedMotion ? '' : 'animate-pulse'}`
                  } else {
                    stateClassName = 'border-border opacity-30'
                  }
                }

                return (
                  <button
                    key={option.optionId}
                    type="button"
                    disabled={phase !== 'recall'}
                    onClick={() => handleGuess(option.optionId)}
                    aria-label="Essence option"
                    className={`flex aspect-square items-center justify-center rounded-2xl border p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${stateClassName}`}
                  >
                    <EssenceIconDisplay
                      iconId={currentRound.target.iconId}
                      color={option.color}
                      rotationDeg={option.rotationDeg}
                      scale={option.scale}
                      size="small"
                    />
                  </button>
                )
              })}
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
      </div>
    </ReadingLayout>
  )
}
