'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { computeReadingPowerScore } from '@/app/unified-quantum-session-preview/components/quantumReadingSprintDataset'
import { pickJourneyReadingSet, type JourneyReadingSet, type JourneyLengthTier } from '../../readingContent'
import { ComprehensionQuestionFlow } from './ComprehensionQuestionFlow'
import { splitWordAtOrp, clampTargetWpm, MIN_TARGET_WPM, MAX_TARGET_WPM } from '../pacingMath'

export type RsvpModeResult = {
  wpm: number
  accuracyPercent: number
  score: number
  selectedSet: JourneyReadingSet
}

type RsvpModePlayerProps = {
  lengthTier: JourneyLengthTier
  initialTargetWpm: number
  onComplete: (result: RsvpModeResult) => void
  // When provided, skips the internal pickJourneyReadingSet(lengthTier)
  // call below and reads this set instead — used by the Baseline Reading
  // Speed Diagnostic™, which draws from its own separate, anti-repeat-safe
  // content pool (diagnosticContent.ts) rather than the real 21-day
  // rotation. `lengthTier` is still required in that case only for type
  // consistency with the rest of this component; it has no effect once
  // `selectedSetOverride` is supplied. The caller must still pick it
  // client-side only, for the same hydration-mismatch reason as the
  // internal pick below.
  selectedSetOverride?: JourneyReadingSet
}

function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0)
}

type Phase = 'reading' | 'question'

// Advanced RSVP Mode™ (Weeks 2 & 3) — Rapid Serial Visual Presentation: a
// high-performance central flash container showing one word at a time at
// the exact target WPM, with an Optimal Recognition Point (ORP) —
// pacingMath.ts's own Spritz-style heuristic — highlighted within each
// word so the eye can stay fixed on one screen position rather than
// scanning, the mechanism this technique uses to reduce sub-vocalization.
export function RsvpModePlayer({ lengthTier, initialTargetWpm, onComplete, selectedSetOverride }: RsvpModePlayerProps): React.JSX.Element | null {
  // Client-only pick — picking during SSR would render one passage on the
  // server and a different random one on the client, a real hydration
  // mismatch (the same class of bug fixed in JourneyReadingModePlayer).
  const [selectedSet, setSelectedSet] = useState<JourneyReadingSet | null>(selectedSetOverride ?? null)
  useEffect(() => {
    if (selectedSetOverride !== undefined) return
    setSelectedSet(pickJourneyReadingSet(lengthTier))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const words = useMemo(() => (selectedSet !== null ? splitIntoWords(selectedSet.text) : []), [selectedSet])

  const [phase, setPhase] = useState<Phase>('reading')
  const [wordIndex, setWordIndex] = useState(0)
  const [targetWpm, setTargetWpm] = useState(() => clampTargetWpm(initialTargetWpm))
  const [isPaused, setIsPaused] = useState(false)
  const [activeElapsedMs, setActiveElapsedMs] = useState(0)

  // Advance one word every (60000 / targetWpm) ms — a fresh timeout is
  // scheduled per word (rather than one fixed setInterval) so a live WPM
  // change or pause takes effect starting with the very next word, not
  // after the current interval finishes.
  useEffect(() => {
    if (selectedSet === null || phase !== 'reading' || isPaused) return undefined
    if (wordIndex >= words.length) return undefined
    const dwellMs = 60000 / targetWpm
    const tickStartedAt = Date.now()
    const timeout = setTimeout(() => {
      setActiveElapsedMs((elapsed) => elapsed + (Date.now() - tickStartedAt))
      const nextIndex = wordIndex + 1
      if (nextIndex >= words.length) {
        setPhase('question')
      } else {
        setWordIndex(nextIndex)
      }
    }, dwellMs)
    return () => clearTimeout(timeout)
  }, [selectedSet, phase, isPaused, wordIndex, words.length, targetWpm])

  function handleQuestionsFinished(correctCount: number): void {
    if (selectedSet === null) return
    const accuracyPercent = Math.round((correctCount / 2) * 100)
    const wpm = activeElapsedMs > 0 ? Math.round((words.length / activeElapsedMs) * 60000) : 0
    const score = computeReadingPowerScore(wpm, accuracyPercent)
    onComplete({ wpm, accuracyPercent, score, selectedSet })
  }

  if (selectedSet === null) return null

  const currentWord = words[wordIndex]
  const progressPercent = words.length === 0 ? 100 : Math.round(((wordIndex + 1) / words.length) * 100)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center gap-6 px-6 py-12 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">RSVP Mode™</p>

      {phase === 'reading' && currentWord !== undefined && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Fixation anchor — static tick marks above/below the ORP
              column so the eye has a fixed screen target regardless of
              word length. */}
          <div className="relative flex h-20 w-full max-w-md items-center justify-center">
            <div className="absolute top-0 h-3 w-px bg-muted-foreground/40" aria-hidden="true" />
            <div className="absolute bottom-0 h-3 w-px bg-muted-foreground/40" aria-hidden="true" />
            {(() => {
              const { before, orpChar, after } = splitWordAtOrp(currentWord)
              return (
                <p key={wordIndex} className="flex items-baseline font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  <span className="inline-block text-right" style={{ minWidth: '2ch' }}>
                    {before}
                  </span>
                  <span className="text-red-500">{orpChar}</span>
                  <span className="inline-block text-left" style={{ minWidth: '2ch' }}>
                    {after}
                  </span>
                </p>
              )
            })()}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent/20"
            >
              {isPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-1.5">
            <label htmlFor="rsvp-wpm-slider" className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Speed: {targetWpm} WPM
            </label>
            <input
              id="rsvp-wpm-slider"
              type="range"
              min={MIN_TARGET_WPM}
              max={MAX_TARGET_WPM}
              step={10}
              value={targetWpm}
              onChange={(e) => setTargetWpm(clampTargetWpm(Number(e.target.value)))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      )}

      {phase === 'question' && <ComprehensionQuestionFlow selectedSet={selectedSet} onFinish={handleQuestionsFinished} />}
    </div>
  )
}
