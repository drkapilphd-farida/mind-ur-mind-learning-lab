'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import {
  ROUNDS_PER_SESSION,
  PRESENTATION_DURATION_CHOICES_MS,
  ROTATION_PROMPT_DURATION_MS,
  RECALL_TIME_LIMIT_MS,
  TIMING_BONUS_WINDOW_MS,
  PERFECT_SESSION_BONUS,
  ROTATION_LABELS,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getColorSwatch,
  type RotationRound,
  type ColorName,
} from '../quantumMentalRotationDataset'
import { ObjectVisualDisplay } from './ObjectVisualDisplay'

const TICK_MS = 100
const REVEAL_DURATION_MS = 2000
const MAX_PRESENTATION_DURATION_MS = Math.max(...PRESENTATION_DURATION_CHOICES_MS)

type RoundPhase = 'presentation' | 'rotating' | 'recall' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  wasFast: boolean
}

type QuantumMentalRotationCanvasProps = {
  onComplete: (elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number, fastestReactionMs: number | null) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

function pickRandomPresentationDurationMs(): number {
  const value = PRESENTATION_DURATION_CHOICES_MS[Math.floor(Math.random() * PRESENTATION_DURATION_CHOICES_MS.length)]
  if (value === undefined) throw new Error('presentation duration pool unexpectedly empty')
  return value
}

function faceDisplayName(face: string): string {
  return face.toUpperCase()
}

// Quantum Mental Object Rotation™ (first Visualization Development
// exercise) — deliberately NOT built on useReadingRuntime/ReadingHeader:
// a rotation round has no word count to honestly dose a WPM-paced dwell
// time against, and there's no target-pace concept here. Instead this
// reuses the two genuinely generic shell atoms directly (ReadingLayout,
// ReadingProgressBar, ReadingStatTile), matching every sibling gamified
// exercise's own precedent. Every round runs 3 real phases in sequence —
// presentation (memorize), rotating (mentally simulate the prompted
// rotation while the object is hidden), recall (answer immediately once
// the 4 options appear, no post-session quiz) — then reveals honestly.
// There is no lives/Game Over branch: every session runs its full
// ROUNDS_PER_SESSION and always ends in a genuine completion.
export function QuantumMentalRotationCanvas({ onComplete, onExitRequested }: QuantumMentalRotationCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rounds] = useState<readonly RotationRound[]>(() => buildSessionRounds())
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<RoundPhase>('presentation')
  const [presentationRemainingMs, setPresentationRemainingMs] = useState(() => pickRandomPresentationDurationMs())
  const [rotatingRemainingMs, setRotatingRemainingMs] = useState(ROTATION_PROMPT_DURATION_MS)
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

  const currentRound: RotationRound | undefined = rounds[roundIndex]

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // Presentation — the object and its full, honest color legend are
  // visible while this counts down. Hands off to the hidden "rotating"
  // phase once the memorization window is over.
  useEffect(() => {
    if (phase !== 'presentation') return
    if (presentationRemainingMs <= 0) {
      setRotatingRemainingMs(ROTATION_PROMPT_DURATION_MS)
      setPhase('rotating')
      return
    }
    const timeout = setTimeout(() => setPresentationRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, presentationRemainingMs])

  // Rotating — the object is hidden and only the rotation instruction is
  // shown, giving a fixed window to mentally simulate it before the 4
  // options appear.
  useEffect(() => {
    if (phase !== 'rotating') return
    if (rotatingRemainingMs <= 0) {
      setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
      setPhase('recall')
      return
    }
    const timeout = setTimeout(() => setRotatingRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, rotatingRemainingMs])

  // Recall — the 4 options appear the instant this phase starts
  // (immediate recall, no post-session quiz). Running out counts as a
  // miss exactly like a wrong tap. This same countdown doubles as the
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

  // Auto-advances to the next round or finishes the sprint once a guess
  // has been revealed. Depends only on `phase`, matching the same
  // established pattern every sibling gamified exercise's own
  // reveal-advance effect uses.
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
        setPresentationRemainingMs(pickRandomPresentationDurationMs())
        setPhase('presentation')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleGuess(colorName: ColorName): void {
    if (phase !== 'recall' || currentRound === undefined) return
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
      playCorrectChime()
    } else {
      setStreak(0)
      setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
      playGentleMissChime()
    }
  }

  function handleTimeout(): void {
    if (phase !== 'recall') return
    setSelectedColorName(null)
    setPhase('revealing')
    setStreak(0)
    setLastOutcome({ isCorrect: false, pointsEarned: 0, wasFast: false })
    playGentleMissChime()
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
  const presentationSeconds = (presentationRemainingMs / 1000).toFixed(1)
  const rotatingSeconds = (rotatingRemainingMs / 1000).toFixed(1)
  const recallSeconds = (recallRemainingMs / 1000).toFixed(1)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      {/* Scoped to this exercise's own content only (ReadingLayout itself
          is shared/locked, untouched) — a defensive clamp so nothing this
          canvas renders (the 3D object, option swatches) can ever
          visually escape to the right on narrow mobile viewports. */}
      <div className="w-full overflow-x-hidden">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Quantum Mental Object Rotation™</p>

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

        {phase === 'presentation' && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">Memorize every face&apos;s color.</p>
            <ObjectVisualDisplay skin={currentRound.skin} state={currentRound.initialState} />
            <div className="grid grid-cols-3 gap-3 text-center text-[11px] text-muted-foreground">
              {(['top', 'front', 'right'] as const).map((face) => (
                <div key={face} className="flex flex-col items-center gap-1">
                  <span
                    className="size-4 rounded-full border border-border/50"
                    style={{ backgroundColor: getColorSwatch(currentRound.initialState[face]).hex }}
                    aria-hidden="true"
                  />
                  <span className="uppercase tracking-wide">{face}</span>
                </div>
              ))}
            </div>
            <div className="w-40">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full bg-foreground ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                  style={{ width: `${(presentationRemainingMs / MAX_PRESENTATION_DURATION_MS) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{presentationSeconds}s</p>
            </div>
          </div>
        )}

        {phase === 'rotating' && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-center text-lg font-semibold text-foreground">{ROTATION_LABELS[currentRound.rotationType]}</p>
            <p className="text-sm text-muted-foreground">Picture the rotation in your mind...</p>
            <div className="w-40">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full bg-indigo-500 ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                  style={{ width: `${(rotatingRemainingMs / ROTATION_PROMPT_DURATION_MS) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{rotatingSeconds}s</p>
            </div>
          </div>
        )}

        {(phase === 'recall' || phase === 'revealing') && (
          <>
            {phase === 'revealing' && lastOutcome !== null ? (
              <p className={`mt-6 text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {lastOutcome.isCorrect
                  ? `Correct! +${lastOutcome.pointsEarned} points${lastOutcome.wasFast ? ' (fast bonus!)' : ''}`
                  : `Not quite — it was ${getColorSwatch(currentRound.correctColorName).label}.`}
              </p>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-center text-sm text-muted-foreground">
                  After that rotation, which color is now facing {faceDisplayName(currentRound.targetFace)}?
                </p>
                <div className="w-32">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full bg-red-500 ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                      style={{ width: `${(recallRemainingMs / RECALL_TIME_LIMIT_MS) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[10px] text-muted-foreground tabular-nums">{recallSeconds}s to answer</p>
                </div>
              </div>
            )}

            <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-2 gap-4">
              {currentRound.optionColorNames.map((colorName) => {
                const swatch = getColorSwatch(colorName)
                const isCorrectOption = phase === 'revealing' && colorName === currentRound.correctColorName
                const isPickedWrong =
                  phase === 'revealing' && selectedColorName === colorName && lastOutcome !== null && !lastOutcome.isCorrect

                let ringClassName = 'border-border hover:border-primary/40'
                if (phase === 'revealing') {
                  if (isCorrectOption) {
                    // An inset glow, not an outward-blurring one — a
                    // box-shadow isn't part of an element's layout box,
                    // so an outward blur can visually bleed past this
                    // card's own rounded border on narrow phones without
                    // ever triggering a measurable scrollbar. Inset keeps
                    // the celebratory highlight strictly inside the card.
                    ringClassName = `border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)] ${prefersReducedMotion ? '' : 'scale-105'}`
                  } else if (isPickedWrong) {
                    ringClassName = `border-red-500 ${prefersReducedMotion ? '' : 'animate-shake'}`
                  } else {
                    ringClassName = 'border-border opacity-30'
                  }
                }

                return (
                  <button
                    key={colorName}
                    type="button"
                    disabled={phase !== 'recall'}
                    onClick={() => handleGuess(colorName)}
                    aria-label={`Answer: ${swatch.label}`}
                    className={`flex aspect-square items-center justify-center rounded-2xl border-2 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 active:scale-95 ${ringClassName}`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                )
              })}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
      </div>
    </ReadingLayout>
  )
}
