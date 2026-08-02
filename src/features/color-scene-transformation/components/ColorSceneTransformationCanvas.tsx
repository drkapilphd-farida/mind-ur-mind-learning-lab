'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  ROUNDS_PER_SESSION,
  CHAIN_LENGTH,
  STEP_DURATION_MS,
  TRACKING_DURATION_MS,
  RECALL_TIME_LIMIT_MS,
  TIMING_BONUS_WINDOW_MS,
  PERFECT_SESSION_BONUS,
  buildSessionRounds,
  getIntroNarration,
  getStepNarration,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getJourneyColor,
  getTimeOfDay,
  type TransformationRound,
} from '../colorSceneTransformationDataset'
import { SceneTransformationDisplay } from './SceneTransformationDisplay'

const TICK_MS = 100
const REVEAL_DURATION_MS = 2000

type RoundPhase = 'presentation' | 'tracking' | 'recall' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  wasFast: boolean
}

type ColorSceneTransformationCanvasProps = {
  onComplete: (
    elapsedMs: number,
    correctCount: number,
    totalScore: number,
    bestStreak: number,
    fastestReactionMs: number | null,
    totalFocusTimeMs: number,
  ) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

function getMomentNarration(round: TransformationRound, momentIndex: number): string {
  if (round.roundType === 'color') {
    const chain = round.colorChain
    if (momentIndex === 0) return getIntroNarration(round.scene, 'color', chain[0]!.label)
    const from = chain[momentIndex - 1]!.label
    const to = chain[momentIndex]!.label
    return getStepNarration(round.scene, 'color', momentIndex - 1, from, to)
  }
  const chain = round.timeChain
  if (momentIndex === 0) return getIntroNarration(round.scene, 'time-of-day', chain[0]!.label)
  const from = chain[momentIndex - 1]!.label
  const to = chain[momentIndex]!.label
  return getStepNarration(round.scene, 'time-of-day', momentIndex - 1, from, to)
}

function getMomentBackgroundHex(round: TransformationRound, momentIndex: number): string {
  if (round.roundType === 'color') return getJourneyColor(round.colorChain[momentIndex]!.name).hex
  return getTimeOfDay(round.timeChain[momentIndex]!.name).hex
}

// Color & Scene Transformation Journey™ (second Visualization
// Development exercise) — deliberately NOT built on
// useReadingRuntime/ReadingHeader: a transformation round has no word
// count to honestly dose a WPM-paced dwell time against, and there's no
// target-pace concept here. Instead this reuses the two genuinely
// generic shell atoms directly (ReadingLayout, ReadingProgressBar,
// ReadingStatTile), matching every sibling gamified exercise's own
// precedent. Every round narrates a real, fully-shown chain (start →
// step 1 → step 2) before ever hiding the scene, so the recall
// question's correct answer is always exactly the chain's own final
// link — never a fabricated ground truth. There is no lives/Game Over
// branch: every session runs its full ROUNDS_PER_SESSION and always
// ends in a genuine completion.
export function ColorSceneTransformationCanvas({ onComplete, onExitRequested }: ColorSceneTransformationCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [rounds] = useState<readonly TransformationRound[]>(() => buildSessionRounds())
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<RoundPhase>('presentation')
  const [momentIndex, setMomentIndex] = useState(0)
  const [momentRemainingMs, setMomentRemainingMs] = useState(STEP_DURATION_MS)
  const [trackingRemainingMs, setTrackingRemainingMs] = useState(TRACKING_DURATION_MS)
  const [recallRemainingMs, setRecallRemainingMs] = useState(RECALL_TIME_LIMIT_MS)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [fastestReactionMs, setFastestReactionMs] = useState<number | null>(null)
  const [totalFocusTimeMs, setTotalFocusTimeMs] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)

  const currentRound: TransformationRound | undefined = rounds[roundIndex]

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // Presentation — cycles through CHAIN_LENGTH moments (the starting
  // state, then one moment per transformation step), each held for
  // STEP_DURATION_MS. Hands off to the hidden "tracking" phase once the
  // whole chain has been shown.
  useEffect(() => {
    if (phase !== 'presentation') return
    if (momentRemainingMs <= 0) {
      const nextMoment = momentIndex + 1
      if (nextMoment >= CHAIN_LENGTH) {
        setTrackingRemainingMs(TRACKING_DURATION_MS)
        setPhase('tracking')
      } else {
        setMomentIndex(nextMoment)
        setMomentRemainingMs(STEP_DURATION_MS)
      }
      return
    }
    const timeout = setTimeout(() => setMomentRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, momentIndex, momentRemainingMs])

  // Tracking — the scene is hidden and only a "hold it in mind" prompt
  // is shown, giving a fixed window to mentally retain the final state
  // before the 4 options appear.
  useEffect(() => {
    if (phase !== 'tracking') return
    if (trackingRemainingMs <= 0) {
      setRecallRemainingMs(RECALL_TIME_LIMIT_MS)
      setPhase('recall')
      return
    }
    const timeout = setTimeout(() => setTrackingRemainingMs((ms) => Math.max(0, ms - TICK_MS)), TICK_MS)
    return () => clearTimeout(timeout)
  }, [phase, trackingRemainingMs])

  // Recall — the 4 options appear the instant this phase starts
  // (immediate recall, no post-session quiz). Running out counts as a
  // miss exactly like a wrong tap. This same countdown doubles as the
  // reaction-time clock the timing bonus and focus-time total are
  // computed from.
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
          onComplete(elapsedMsRef.current, correctCount, totalScore + perfectBonus, bestStreakThisSession, fastestReactionMs, totalFocusTimeMs)
        }
      } else {
        setRoundIndex(nextRound)
        setSelectedAnswer(null)
        setLastOutcome(null)
        setMomentIndex(0)
        setMomentRemainingMs(STEP_DURATION_MS)
        setPhase('presentation')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleGuess(answerName: string): void {
    if (phase !== 'recall' || currentRound === undefined) return
    const reactionTimeMs = RECALL_TIME_LIMIT_MS - recallRemainingMs
    const correctAnswer = currentRound.roundType === 'color' ? currentRound.correctColorName : currentRound.correctTimeOfDayName
    const isCorrect = answerName === correctAnswer
    setSelectedAnswer(answerName)
    setPhase('revealing')
    setTotalFocusTimeMs((ms) => ms + reactionTimeMs)

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
    if (phase !== 'recall') return
    setSelectedAnswer(null)
    setPhase('revealing')
    setStreak(0)
    setTotalFocusTimeMs((ms) => ms + RECALL_TIME_LIMIT_MS)
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
  const momentSeconds = (momentRemainingMs / 1000).toFixed(1)
  const trackingSeconds = (trackingRemainingMs / 1000).toFixed(1)
  const recallSeconds = (recallRemainingMs / 1000).toFixed(1)

  const correctAnswerName = currentRound.roundType === 'color' ? currentRound.correctColorName : currentRound.correctTimeOfDayName
  const correctAnswerLabel =
    currentRound.roundType === 'color' ? getJourneyColor(currentRound.correctColorName).label : getTimeOfDay(currentRound.correctTimeOfDayName).label
  const questionText = currentRound.roundType === 'color' ? 'What color did the scene become?' : 'What time of day did the scene reach?'

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      {/* Scoped to this exercise's own content only (ReadingLayout itself
          is shared/locked, untouched) — a defensive clamp so nothing this
          canvas renders (the transforming scene card, option swatches)
          can ever visually escape to the right on narrow mobile
          viewports. */}
      <div className="w-full overflow-x-hidden">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Color & Scene Transformation Journey™</p>

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
            <p className="min-h-10 max-w-sm text-center text-sm text-muted-foreground">{getMomentNarration(currentRound, momentIndex)}</p>
            <SceneTransformationDisplay
              backgroundHex={getMomentBackgroundHex(currentRound, momentIndex)}
              timeOfDayName={currentRound.roundType === 'time-of-day' ? currentRound.timeChain[momentIndex]?.name : undefined}
              prefersReducedMotion={prefersReducedMotion}
            />
            <div className="w-40">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full bg-foreground ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                  style={{ width: `${(momentRemainingMs / STEP_DURATION_MS) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{momentSeconds}s</p>
            </div>
          </div>
        )}

        {phase === 'tracking' && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-center text-lg font-semibold text-foreground">Hold that final state in your mind...</p>
            <p className="text-sm text-muted-foreground">The scene has faded — keep picturing it.</p>
            <div className="w-40">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full bg-indigo-500 ${prefersReducedMotion ? '' : 'transition-[width] duration-100 ease-linear'}`}
                  style={{ width: `${(trackingRemainingMs / TRACKING_DURATION_MS) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">{trackingSeconds}s</p>
            </div>
          </div>
        )}

        {(phase === 'recall' || phase === 'revealing') && (
          <>
            {phase === 'revealing' && lastOutcome !== null ? (
              <p className={`mt-6 text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {lastOutcome.isCorrect
                  ? `Correct! +${lastOutcome.pointsEarned} points${lastOutcome.wasFast ? ' (fast bonus!)' : ''}`
                  : `Not quite — it ended on ${correctAnswerLabel}.`}
              </p>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-center text-sm text-muted-foreground">{questionText}</p>
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
              {currentRound.roundType === 'color'
                ? currentRound.optionColorNames.map((colorName) => {
                    const swatch = getJourneyColor(colorName)
                    const isCorrectOption = phase === 'revealing' && colorName === correctAnswerName
                    const isPickedWrong =
                      phase === 'revealing' && selectedAnswer === colorName && lastOutcome !== null && !lastOutcome.isCorrect
                    const ringClassName = getOptionRingClassName(phase, isCorrectOption, isPickedWrong, prefersReducedMotion)

                    return (
                      <button
                        key={colorName}
                        type="button"
                        disabled={phase !== 'recall'}
                        onClick={() => handleGuess(colorName)}
                        aria-label={`Answer: ${swatch.label}`}
                        className={`flex aspect-square items-center justify-center rounded-2xl border-2 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${ringClassName}`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    )
                  })
                : currentRound.optionTimeOfDayNames.map((timeName) => {
                    const time = getTimeOfDay(timeName)
                    const isCorrectOption = phase === 'revealing' && timeName === correctAnswerName
                    const isPickedWrong =
                      phase === 'revealing' && selectedAnswer === timeName && lastOutcome !== null && !lastOutcome.isCorrect
                    const ringClassName = getOptionRingClassName(phase, isCorrectOption, isPickedWrong, prefersReducedMotion)

                    return (
                      <button
                        key={timeName}
                        type="button"
                        disabled={phase !== 'recall'}
                        onClick={() => handleGuess(timeName)}
                        aria-label={`Answer: ${time.label}`}
                        className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${ringClassName}`}
                        style={{ backgroundColor: time.hex }}
                      >
                        <span className="text-xs font-semibold text-white/90 drop-shadow-sm">{time.label}</span>
                      </button>
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

function getOptionRingClassName(phase: RoundPhase, isCorrectOption: boolean, isPickedWrong: boolean, prefersReducedMotion: boolean): string {
  if (phase !== 'revealing') return 'border-border hover:border-primary/40'
  if (isCorrectOption) {
    // An inset glow, not an outward-blurring one — a box-shadow isn't
    // part of an element's layout box, so an outward blur can visually
    // bleed past this card's own rounded border on narrow phones without
    // ever triggering a measurable scrollbar. Inset keeps the
    // celebratory highlight strictly inside the card.
    return `border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)] ${prefersReducedMotion ? '' : 'scale-105'}`
  }
  if (isPickedWrong) return `border-red-500 ${prefersReducedMotion ? '' : 'animate-pulse'}`
  return 'border-border opacity-30'
}
