'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import { ReadingProgressBar } from '@/features/reading-engine/components/ReadingProgressBar'
import { ReadingStatTile } from '@/features/reading-engine/components/ReadingStatTile'
import {
  ZENER_SYMBOLS,
  ZENER_DECK_SIZE,
  generateShuffledZenerDeck,
  computeStreakMultiplier,
  computePointsForCorrectGuess,
  type ZenerSymbolId,
} from '../espZenerDataset'
import { playCorrectGuessSound, playIncorrectGuessSound } from '../espZenerSound'
import { ZenerSymbolIcon } from './ZenerSymbolIcon'

const TICK_MS = 100
const REVEAL_DURATION_MS = 1100
const SOUND_ENABLED_STORAGE_KEY = 'qsr-esp-zener-sound-enabled'

type RoundPhase = 'guessing' | 'revealing'

type GuessOutcome = {
  isCorrect: boolean
  pointsEarned: number
  targetSymbolId: ZenerSymbolId
}

type EspZenerTelepathyCanvasProps = {
  onComplete: (elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number) => void
  onExitRequested: (elapsedMs: number) => void
}

function loadSoundEnabledPreference(): boolean {
  if (typeof window === 'undefined') return true
  const raw = window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY)
  return raw === null ? true : raw === 'true'
}

function getMultiplierBadgeClassName(multiplier: number): string {
  if (multiplier >= 4) return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700'
  if (multiplier === 3) return 'border-orange-500/60 bg-orange-500/10 text-orange-700'
  if (multiplier === 2) return 'border-amber-500/60 bg-amber-500/10 text-amber-700'
  return 'border-border text-muted-foreground'
}

// ESP Zener Card Telepathy Sprint™ — deliberately NOT built on
// useReadingRuntime/ReadingHeader: there is no honest WPM/target-pace
// concept for a pure gut-feeling guessing game, so forcing this into that
// contract would mean fabricating a WPM number just to satisfy its prop
// shape (same reasoning SchulteGridDrillCanvas.tsx already documents).
// Instead this reuses the two genuinely generic shell atoms directly
// (ReadingLayout, ReadingProgressBar, ReadingStatTile) and owns its own
// minimal 100ms tick purely to drive an honest live stopwatch, matching
// useReadingRuntime.ts's own tick rate for consistency.
export function EspZenerTelepathyCanvas({ onComplete, onExitRequested }: EspZenerTelepathyCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [deck] = useState<readonly ZenerSymbolId[]>(() => generateShuffledZenerDeck())
  const [cardIndex, setCardIndex] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('guessing')
  const [selectedSymbolId, setSelectedSymbolId] = useState<ZenerSymbolId | null>(null)
  const [lastOutcome, setLastOutcome] = useState<GuessOutcome | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreakThisSession, setBestStreakThisSession] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const hasCalledCompleteRef = useRef(false)
  const elapsedMsRef = useRef(0)

  useEffect(() => {
    setSoundEnabled(loadSoundEnabledPreference())
  }, [])

  useEffect(() => {
    elapsedMsRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedMs((ms) => ms + TICK_MS), TICK_MS)
    return () => clearInterval(interval)
  }, [isComplete])

  // Auto-advances to the next card (or finishes the deck) once a guess has
  // been revealed. Depends only on `roundPhase`, matching the same
  // established pattern ComprehensionCheckpoint.tsx's own auto-advance
  // effect uses — correctCount/totalScore/bestStreakThisSession/cardIndex
  // are all stable for the whole reveal window (nothing else updates them
  // then) so reading them directly here is accurate, not stale; only
  // elapsedMs keeps ticking independently during the reveal, which is why
  // it's read via a ref instead.
  useEffect(() => {
    if (roundPhase !== 'revealing') return
    const timeout = setTimeout(() => {
      const nextIndex = cardIndex + 1
      if (nextIndex >= ZENER_DECK_SIZE) {
        setIsComplete(true)
        if (!hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true
          onComplete(elapsedMsRef.current, correctCount, totalScore, bestStreakThisSession)
        }
      } else {
        setCardIndex(nextIndex)
        setSelectedSymbolId(null)
        setLastOutcome(null)
        setRoundPhase('guessing')
      }
    }, REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase])

  function handleGuess(symbolId: ZenerSymbolId): void {
    if (roundPhase !== 'guessing') return
    const targetSymbolId = deck[cardIndex]
    if (targetSymbolId === undefined) return

    const isCorrect = symbolId === targetSymbolId
    setSelectedSymbolId(symbolId)
    setRoundPhase('revealing')

    if (isCorrect) {
      const newStreak = streak + 1
      const pointsEarned = computePointsForCorrectGuess(newStreak)
      setStreak(newStreak)
      setBestStreakThisSession((best) => Math.max(best, newStreak))
      setCorrectCount((count) => count + 1)
      setTotalScore((score) => score + pointsEarned)
      setLastOutcome({ isCorrect: true, pointsEarned, targetSymbolId })
      if (soundEnabled) playCorrectGuessSound()
    } else {
      setStreak(0)
      setLastOutcome({ isCorrect: false, pointsEarned: 0, targetSymbolId })
      if (soundEnabled) playIncorrectGuessSound()
    }
  }

  function handleToggleSound(): void {
    setSoundEnabled((current) => {
      const next = !current
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(next))
      }
      return next
    })
  }

  const attemptsSoFar = cardIndex + (roundPhase === 'revealing' ? 1 : 0)
  const accuracySoFar = attemptsSoFar > 0 ? Math.round((correctCount / attemptsSoFar) * 100) : 0
  const progressPercent = Math.round((attemptsSoFar / ZENER_DECK_SIZE) * 100)
  const multiplier = computeStreakMultiplier(streak)
  const targetLabel = lastOutcome ? (ZENER_SYMBOLS.find((symbol) => symbol.id === lastOutcome.targetSymbolId)?.label ?? '') : ''

  return (
    <ReadingLayout maxWidthClassName="max-w-2xl" onExit={() => onExitRequested(elapsedMs)}>
      <div className="flex w-full items-center justify-between">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">ESP Zener Card Telepathy Sprint™</p>
        <button
          type="button"
          onClick={handleToggleSound}
          aria-pressed={soundEnabled}
          className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadingStatTile label="Card" value={`${cardIndex + 1} / ${ZENER_DECK_SIZE}`} />
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

      {roundPhase === 'revealing' && lastOutcome !== null ? (
        <p className={`mt-8 text-center text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
          {lastOutcome.isCorrect ? `Correct! +${lastOutcome.pointsEarned} points` : `Not quite — it was ${targetLabel}.`}
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-muted-foreground">Trust your first instinct. Which symbol is it?</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {ZENER_SYMBOLS.map((symbol) => {
          const isTarget = roundPhase === 'revealing' && lastOutcome !== null && symbol.id === lastOutcome.targetSymbolId
          const isPickedWrong =
            roundPhase === 'revealing' && selectedSymbolId === symbol.id && lastOutcome !== null && !lastOutcome.isCorrect

          let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
          if (roundPhase === 'revealing') {
            if (isTarget) {
              stateClassName = `border-emerald-500/70 bg-emerald-500/10 text-emerald-700 shadow-[0_0_24px_rgba(16,185,129,0.45)] ${prefersReducedMotion ? '' : 'scale-105'}`
            } else if (isPickedWrong) {
              stateClassName = `border-red-500/60 bg-red-500/10 text-red-700 ${prefersReducedMotion ? '' : 'animate-pulse'}`
            } else {
              stateClassName = 'border-border opacity-40'
            }
          }

          return (
            <button
              key={symbol.id}
              type="button"
              disabled={roundPhase === 'revealing'}
              onClick={() => handleGuess(symbol.id)}
              aria-label={symbol.label}
              className={`flex w-24 flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 sm:w-28 ${stateClassName}`}
            >
              <ZenerSymbolIcon symbolId={symbol.id} className="size-8 sm:size-10" />
              <span className="text-xs font-medium">{symbol.label}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">{formatElapsedTime(elapsedMs)} elapsed</p>
    </ReadingLayout>
  )
}
