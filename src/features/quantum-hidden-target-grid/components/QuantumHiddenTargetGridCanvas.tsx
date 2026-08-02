'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, CheckCircle2, Target, XCircle, type LucideIcon } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  GRID_SIZE,
  GRID_COLUMNS,
  generateShuffledTargetSequence,
  computeStreakMultiplier,
  computeEnergyForCorrectGuess,
} from '../quantumHiddenTargetGridDataset'

const TICK_MS = 100
const REVEAL_DURATION_MS = 1100

type RoundPhase = 'guessing' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  energyEarned: number
  targetTileIndex: number
}

type QuantumHiddenTargetGridCanvasProps = {
  onComplete: (elapsedMs: number, correctCount: number, totalEnergy: number, bestStreak: number) => void
  onExitRequested: (elapsedMs: number) => void
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700'
  if (multiplier === 3) return 'border-violet-500/60 bg-violet-500/10 text-violet-700'
  if (multiplier === 2) return 'border-indigo-500/60 bg-indigo-500/10 text-indigo-700'
  return 'border-border text-muted-foreground'
}

// Quantum Hidden Target Grid™ — deliberately NOT built on
// useReadingRuntime/ReadingHeader: there is no honest WPM/target-pace
// concept for a pure gut-feeling guessing game, same reasoning
// EspZenerTelepathyCanvas.tsx/SchulteGridDrillCanvas.tsx already document.
// Instead this reuses the two genuinely generic shell atoms directly
// (ReadingLayout, ReadingProgressBar, ReadingStatTile) and owns its own
// minimal 100ms tick purely to drive an honest live stopwatch.
export function QuantumHiddenTargetGridCanvas({ onComplete, onExitRequested }: QuantumHiddenTargetGridCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [targetSequence] = useState<readonly number[]>(() => generateShuffledTargetSequence())
  const [roundIndex, setRoundIndex] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('guessing')
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalEnergy, setTotalEnergy] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // Auto-advances to the next round (or finishes the grid) once a guess
  // has been revealed. Depends only on `roundPhase`, matching the same
  // established pattern EspZenerTelepathyCanvas.tsx's own reveal-advance
  // effect uses — correctCount/totalEnergy/bestStreakThisSession/
  // roundIndex are all stable for the whole reveal window (nothing else
  // updates them then) so reading them directly here is accurate, not
  // stale; only elapsedMs keeps ticking independently during the reveal,
  // which is why it's read via a ref instead.
  useEffect(() => {
    if (roundPhase !== 'revealing') return
    const timeout = setTimeout(() => {
      const nextRound = roundIndex + 1
      if (nextRound >= GRID_SIZE) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onComplete(elapsedMsRef.current, correctCount, totalEnergy, bestStreakThisSession)
        }
      } else {
        setRoundIndex(nextRound)
        setSelectedTileIndex(null)
        setLastOutcome(null)
        setRoundPhase('guessing')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase])

  function handleGuess(tileIndex: number): void {
    if (roundPhase !== 'guessing') return
    const targetTileIndex = targetSequence[roundIndex]
    if (targetTileIndex === undefined) return

    const isCorrect = tileIndex === targetTileIndex
    setSelectedTileIndex(tileIndex)
    setRoundPhase('revealing')

    if (isCorrect) {
      const newStreak = streak + 1
      const energyEarned = computeEnergyForCorrectGuess(newStreak)
      setStreak(newStreak)
      setBestStreakThisSession((best) => Math.max(best, newStreak))
      setCorrectCount((count) => count + 1)
      setTotalEnergy((energy) => energy + energyEarned)
      setLastOutcome({ isCorrect: true, energyEarned, targetTileIndex })
    } else {
      setStreak(0)
      setLastOutcome({ isCorrect: false, energyEarned: 0, targetTileIndex })
    }
  }

  const attemptsSoFar = roundIndex + (roundPhase === 'revealing' ? 1 : 0)
  const accuracySoFar = attemptsSoFar > 0 ? Math.round((correctCount / attemptsSoFar) * 100) : 0
  const progressPercent = Math.round((attemptsSoFar / GRID_SIZE) * 100)
  const multiplier = computeStreakMultiplier(streak)

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Quantum Hidden Target Grid™</p>

      <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadingStatTile label="Round" value={`${roundIndex + 1} / ${GRID_SIZE}`} />
        <ReadingStatTile label="Energy" value={String(totalEnergy)} />
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

      {roundPhase === 'revealing' && lastOutcome !== null ? (
        <p className={`mt-8 text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
          {lastOutcome.isCorrect ? `Direct hit! +${lastOutcome.energyEarned} energy` : 'Not quite — the target is glowing below.'}
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-muted-foreground">Trust your first instinct. Which box holds it?</p>
      )}

      <div
        className="mt-6 grid w-full max-w-sm gap-3"
        style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID_SIZE }, (_, tileIndex) => {
          const isTarget = roundPhase === 'revealing' && lastOutcome !== null && tileIndex === lastOutcome.targetTileIndex
          const isPickedCorrect = roundPhase === 'revealing' && selectedTileIndex === tileIndex && lastOutcome !== null && lastOutcome.isCorrect
          const isPickedWrong = roundPhase === 'revealing' && selectedTileIndex === tileIndex && lastOutcome !== null && !lastOutcome.isCorrect

          let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
          let TileIcon: LucideIcon = Box
          let iconClassName = 'text-muted-foreground/40'

          if (roundPhase === 'revealing') {
            if (isPickedCorrect) {
              stateClassName = `border-emerald-500/70 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.45)] ${prefersReducedMotion ? '' : 'scale-105'}`
              TileIcon = CheckCircle2
              iconClassName = 'text-emerald-600'
            } else if (isTarget) {
              stateClassName = `border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_24px_rgba(99,102,241,0.45)] ${prefersReducedMotion ? '' : 'scale-105'}`
              TileIcon = Target
              iconClassName = 'text-indigo-600'
            } else if (isPickedWrong) {
              stateClassName = `border-red-500/60 bg-red-500/10 ${prefersReducedMotion ? '' : 'animate-pulse'}`
              TileIcon = XCircle
              iconClassName = 'text-red-600'
            } else {
              stateClassName = 'border-border opacity-30'
            }
          }

          return (
            <button
              key={tileIndex}
              type="button"
              disabled={roundPhase === 'revealing'}
              onClick={() => handleGuess(tileIndex)}
              aria-label={`Tile ${tileIndex + 1}`}
              className={`flex aspect-square items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${stateClassName}`}
            >
              <TileIcon className={`size-5 sm:size-6 ${iconClassName}`} aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
    </ReadingLayout>
  )
}
