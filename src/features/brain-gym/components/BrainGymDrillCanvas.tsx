'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import { playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import type { BrainGymDrillConfig, BrainGymRound } from '../types'

const REVEAL_DURATION_MS = 700
const TICK_MS = 100

type RoundPhase = 'stimulus' | 'response' | 'reveal'

type BrainGymDrillCanvasProps = {
  config: BrainGymDrillConfig
  onComplete: (elapsedMs: number, correctCount: number, bestStreak: number, averageReactionMs: number) => void
  onExitRequested: (elapsedMs: number) => void
}

// Shared engine for all 4 Brain Gym drills — each is genuinely the same
// shape (flash or show a stimulus, present options, react, track
// accuracy/streak/reaction time), just with a different `buildRound` and
// copy (see ../configs/*). Deliberately NOT built on useReadingRuntime —
// same reasoning EspZenerTelepathyCanvas.tsx's own comment gives: no
// honest WPM/target-pace concept for a reaction-choice drill, so this
// reuses the generic ReadingLayout/ReadingProgressBar/ReadingStatTile
// atoms directly instead of fabricating a WPM figure to fit that shape.
export function BrainGymDrillCanvas({ config, onComplete, onExitRequested }: BrainGymDrillCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState<BrainGymRound>(() => config.buildRound(0))
  const [phase, setPhase] = useState<RoundPhase>(config.stimulusDurationMs > 0 ? 'stimulus' : 'response')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isLastCorrect, setIsLastCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [reactionTimesMs, setReactionTimesMs] = useState<readonly number[]>([])
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const responseStartRef = useRef<number>(Date.now())
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)
  const reactionTimesRef = useRef<readonly number[]>([])

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    reactionTimesRef.current = reactionTimesMs
  }, [reactionTimesMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // Stimulus → response transition (only when this drill has a real
  // flash phase — Cross-Lateral Tap's stimulusDurationMs is 0, so it
  // skips straight to 'response' and this effect never fires for it).
  useEffect(() => {
    if (phase !== 'stimulus') return
    const timeout = setTimeout(() => {
      responseStartRef.current = Date.now()
      setPhase('response')
    }, config.stimulusDurationMs)
    return () => clearTimeout(timeout)
  }, [phase, config.stimulusDurationMs])

  // Marks the response window's start the moment a new round with no
  // stimulus phase begins (including the very first round on mount).
  useEffect(() => {
    if (config.stimulusDurationMs === 0) {
      responseStartRef.current = Date.now()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex])

  useEffect(() => {
    if (phase !== 'reveal') return
    const timeout = setTimeout(() => {
      const nextIndex = roundIndex + 1
      if (nextIndex >= config.roundCount) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          const times = reactionTimesRef.current
          const averageReactionMs = times.length > 0 ? Math.round(times.reduce((sum, ms) => sum + ms, 0) / times.length) : 0
          onComplete(elapsedMsRef.current, correctCount, bestStreak, averageReactionMs)
        }
        return
      }
      setRoundIndex(nextIndex)
      setRound(config.buildRound(nextIndex))
      setSelectedOptionId(null)
      setIsLastCorrect(null)
      setPhase(config.stimulusDurationMs > 0 ? 'stimulus' : 'response')
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleSelect(optionId: string): void {
    if (phase !== 'response') return
    const reactionMs = Date.now() - responseStartRef.current
    const isCorrect = optionId === round.correctOptionId

    setSelectedOptionId(optionId)
    setIsLastCorrect(isCorrect)
    setPhase('reveal')
    setReactionTimesMs((times) => [...times, reactionMs])

    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setBestStreak((best) => Math.max(best, newStreak))
      setCorrectCount((count) => count + 1)
      playCorrectChime()
    } else {
      setStreak(0)
      playGentleMissChime()
    }
  }

  const attemptsSoFar = roundIndex + (phase === 'reveal' ? 1 : 0)
  const accuracySoFar = attemptsSoFar > 0 ? Math.round((correctCount / attemptsSoFar) * 100) : 0
  const progressPercent = Math.round((attemptsSoFar / config.roundCount) * 100)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{config.title}</p>

      <div className="mt-4 grid w-full grid-cols-3 gap-3">
        <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${config.roundCount}`} />
        <ReadingStatTile label="Streak" value={String(streak)} />
        <ReadingStatTile label="Accuracy" value={`${accuracySoFar}%`} />
      </div>

      <div className="mt-4 w-full">
        <ReadingProgressBar progressPercent={progressPercent} />
      </div>

      <div className={`mt-10 flex min-h-24 w-full ${round.promptContainerClassName ?? 'items-center justify-center'}`}>
        {phase === 'reveal' && isLastCorrect !== null ? (
          <p className={`text-sm font-medium ${isLastCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {isLastCorrect ? 'Correct!' : 'Not quite.'}
          </p>
        ) : phase === 'response' && config.hidePromptDuringResponse ? (
          <p className="text-sm text-muted-foreground">What did you see?</p>
        ) : (
          <p className="font-heading text-5xl font-bold tracking-tight text-foreground">{round.promptLabel}</p>
        )}
      </div>

      {phase !== 'stimulus' && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {round.options.map((option) => {
            const isCorrectOption = phase === 'reveal' && option.id === round.correctOptionId
            const isPickedWrong = phase === 'reveal' && selectedOptionId === option.id && isLastCorrect === false
            let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
            if (phase === 'reveal') {
              if (isCorrectOption) {
                stateClassName = `border-emerald-500/70 bg-emerald-500/10 text-emerald-700 ${prefersReducedMotion ? '' : 'scale-105'}`
              } else if (isPickedWrong) {
                stateClassName = 'border-red-500/60 bg-red-500/10 text-red-700'
              } else {
                stateClassName = 'border-border opacity-40'
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={phase !== 'response'}
                onClick={() => handleSelect(option.id)}
                className={`min-w-24 rounded-2xl border px-6 py-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${stateClassName}`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </ReadingLayout>
  )
}
