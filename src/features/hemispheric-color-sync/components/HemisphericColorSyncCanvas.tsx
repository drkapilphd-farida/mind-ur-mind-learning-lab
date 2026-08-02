'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  ROUNDS_PER_SESSION,
  RECALL_TIME_LIMIT_MS,
  TIMING_BONUS_WINDOW_MS,
  PERFECT_SESSION_BONUS,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getColorSwatch,
  type StroopRound,
  type ColorName,
} from '../hemisphericColorSyncDataset'

const TICK_MS = 100
const REVEAL_DURATION_MS = 700

type RoundPhase = 'active' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  wasFast: boolean
}

type HemisphericColorSyncCanvasProps = {
  onComplete: (elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number, fastestReactionMs: number | null) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

function promptCopy(round: StroopRound): string {
  return round.promptMode === 'word' ? 'Match the WORD it spells' : 'Match the INK it is painted in'
}

// Hemispheric Color-Word Sync Grid™ (third Right Brain Activation
// exercise) — deliberately NOT built on useReadingRuntime/ReadingHeader:
// a Stroop conflict round has no word count to honestly dose a WPM-paced
// dwell time against, and there's no target-pace concept for a pure
// conflict-resolution task. Instead this reuses the two genuinely
// generic shell atoms directly (ReadingLayout, ReadingProgressBar,
// ReadingStatTile), matching every sibling gamified exercise's own
// precedent. Unlike Pictorial Essence Sprint there is no separate flash
// phase and no lives system — the stimulus and its 4 answer options
// appear simultaneously the instant a round starts (immediate recall by
// construction) and the session always runs the full 16 rounds
// regardless of performance, exactly as the task brief specifies.
export function HemisphericColorSyncCanvas({ onComplete, onExitRequested }: HemisphericColorSyncCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rounds] = useState<readonly StroopRound[]>(() => buildSessionRounds())
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<RoundPhase>('active')
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedColorName, setSelectedColorName] = useState<ColorName | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [fastestReactionMs, setFastestReactionMs] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)

  const currentRound: StroopRound | undefined = rounds[roundIndex]

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // The strict per-round recall window — ticks down only while `phase
  // === 'active'`. Running out counts as a miss exactly like a wrong
  // tap (streak resets, the real answer is revealed). This same
  // countdown also doubles as the reaction-time clock the timing bonus
  // is computed from.
  useEffect(() => {
    if (phase !== 'active') return
    if (recallRemainingMs <= 0) {
      handleTimeout()
      return
    }
    const timeout = setTimeout(() => setRecallRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recallRemainingMs])

  // Auto-advances to the next round or finishes the sprint once a guess
  // has been revealed. Depends only on `phase`, matching the same
  // established pattern every sibling gamified exercise's own
  // reveal-advance effect uses — correctCount/totalScore/
  // bestStreakThisSession/fastestReactionMs/roundIndex are all stable for
  // the whole reveal window, so reading them directly here is accurate,
  // not stale; only elapsedMs keeps ticking independently during the
  // reveal, which is why it's read via a ref instead.
  useEffect(() => {
    if (phase !== 'revealing') return
    const timeout = setTimeout(() => {
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
        setSelectedColorName(null)
        setLastOutcome(null)
        setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
        setPhase('active')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleGuess(colorName: ColorName): void {
    if (phase !== 'active' || currentRound === undefined) return
    const reactionTimeMs = RECALL_TIME_LIMIT_MS - recallRemainingMs
    const isCorrect = colorName === currentRound.correctColorName
    setSelectedColorName(colorName)
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
      setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
    }
  }

  function handleTimeout(): void {
    if (phase !== 'active') return
    setSelectedColorName(null)
    setPhase('revealing')
    setStreak(0)
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
  const recallRemainingSeconds = (recallRemainingMs / 1000).toFixed(1)
  const wordSwatch = getColorSwatch(currentRound.wordColorName)
  const inkSwatch = getColorSwatch(currentRound.inkColorName)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      {/* Scoped to this exercise's own content only (ReadingLayout itself
          is shared/locked, untouched) — a defensive clamp so nothing this
          canvas renders (transformed option swatches, reveal glows) can
          ever visually escape to the right on narrow mobile viewports. */}
      <div className="w-full overflow-x-hidden">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Hemispheric Color-Word Sync Grid™</p>

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

        <div className="mt-6 flex justify-center">
          <span className="rounded-full border border-border bg-accent/20 px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground uppercase">
            {promptCopy(currentRound)}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p
            className="text-center text-5xl font-black tracking-tight break-all sm:text-6xl"
            style={{ color: inkSwatch.hex }}
            aria-label={`the word ${wordSwatch.label} painted in ${inkSwatch.label} ink`}
          >
            {wordSwatch.label}
          </p>

          {phase === 'revealing' && lastOutcome !== null ? (
            <p className={`text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {lastOutcome.isCorrect
                ? `Correct! +${lastOutcome.pointsEarned} points${lastOutcome.wasFast ? ' (fast bonus!)' : ''}`
                : `Not quite — it was ${getColorSwatch(currentRound.correctColorName).label}.`}
            </p>
          ) : (
            <div className="w-32">
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full bg-red-500 ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                  style={{ width: `${(recallRemainingMs / RECALL_TIME_LIMIT_MS) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground tabular-nums">{recallRemainingSeconds}s to answer</p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-2 gap-4">
          {currentRound.optionColorNames.map((colorName) => {
            const swatch = getColorSwatch(colorName)
            const isCorrectOption = phase === 'revealing' && colorName === currentRound.correctColorName
            const isPickedWrong = phase === 'revealing' && selectedColorName === colorName && lastOutcome !== null && !lastOutcome.isCorrect

            let ringClassName = 'border-border hover:border-primary/40'
            if (phase === 'revealing') {
              if (isCorrectOption) {
                // An inset glow, not an outward-blurring one — a
                // box-shadow isn't part of an element's layout box, so an
                // outward blur can visually bleed past this card's own
                // rounded border on narrow phones without ever
                // triggering a measurable scrollbar. Inset keeps the
                // celebratory highlight strictly inside the card.
                ringClassName = `border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)] ${prefersReducedMotion ? '' : 'scale-105'}`
              } else if (isPickedWrong) {
                ringClassName = `border-red-500 ${prefersReducedMotion ? '' : 'animate-pulse'}`
              } else {
                ringClassName = 'border-border opacity-30'
              }
            }

            return (
              <button
                key={colorName}
                type="button"
                disabled={phase !== 'active'}
                onClick={() => handleGuess(colorName)}
                aria-label={`Answer: ${swatch.label}`}
                className={`flex aspect-square items-center justify-center rounded-2xl border-2 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${ringClassName}`}
                style={{ backgroundColor: `${swatch.hex}` }}
              />
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
      </div>
    </ReadingLayout>
  )
}
