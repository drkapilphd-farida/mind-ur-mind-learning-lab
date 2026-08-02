'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { computeReadingPowerScore } from '@/app/unified-quantum-session-preview/components/quantumReadingSprintDataset'
import { pickJourneyReadingSet, type JourneyReadingSet, type JourneyLengthTier } from '../../readingContent'
import { ComprehensionQuestionFlow } from './ComprehensionQuestionFlow'
import { clampTargetWpm, MIN_TARGET_WPM, MAX_TARGET_WPM } from '../pacingMath'

export type GuidingLinePacerResult = {
  wpm: number
  accuracyPercent: number
  score: number
  selectedSet: JourneyReadingSet
}

type GuidingLinePacerPlayerProps = {
  lengthTier: JourneyLengthTier
  initialTargetWpm: number
  onComplete: (result: GuidingLinePacerResult) => void
}

function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0)
}

type Phase = 'reading' | 'question'
type BarPosition = { top: number; height: number }

// Visual Pacing™ — Guiding Line Pacer (Week 1). The full passage renders
// as normal static text (never RSVP-style single words — Week 1 is
// Foundation, easing readers into pacing rather than replacing natural
// reading entirely); a horizontal bar tracks beneath the current word's
// own line, advancing automatically at the target WPM, so the eye is
// guided down the page rather than having to find its own place. Word
// position is measured directly via each word's own span (not a
// precomputed line-grouping pass) — the browser's own text reflow is the
// source of truth, so it stays correct across any container width.
export function GuidingLinePacerPlayer({ lengthTier, initialTargetWpm, onComplete }: GuidingLinePacerPlayerProps): React.JSX.Element | null {
  const [selectedSet, setSelectedSet] = useState<JourneyReadingSet | null>(null)
  useEffect(() => {
    setSelectedSet(pickJourneyReadingSet(lengthTier))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const words = useMemo(() => (selectedSet !== null ? splitIntoWords(selectedSet.text) : []), [selectedSet])

  const [phase, setPhase] = useState<Phase>('reading')
  const [wordIndex, setWordIndex] = useState(0)
  const [targetWpm, setTargetWpm] = useState(() => clampTargetWpm(initialTargetWpm))
  const [isPaused, setIsPaused] = useState(false)
  const [activeElapsedMs, setActiveElapsedMs] = useState(0)
  const [barPosition, setBarPosition] = useState<BarPosition | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const wordRefs = useRef(new Map<number, HTMLSpanElement>())

  // Advance one word every (60000 / targetWpm) ms — a fresh timeout per
  // word, exactly like RsvpModePlayer, so a live WPM change or pause
  // takes effect starting with the very next word.
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

  // Measure the current word's line position relative to the container
  // after every render where wordIndex changes, so the bar can animate to
  // it via a CSS transition on `top`.
  useLayoutEffect(() => {
    const container = containerRef.current
    const currentWordEl = wordRefs.current.get(wordIndex)
    if (container === null || currentWordEl === undefined) return
    const containerRect = container.getBoundingClientRect()
    const wordRect = currentWordEl.getBoundingClientRect()
    setBarPosition({ top: wordRect.top - containerRect.top + wordRect.height, height: 3 })
  }, [wordIndex, words])

  function handleQuestionsFinished(correctCount: number): void {
    if (selectedSet === null) return
    const accuracyPercent = Math.round((correctCount / 2) * 100)
    const wpm = activeElapsedMs > 0 ? Math.round((words.length / activeElapsedMs) * 60000) : 0
    const score = computeReadingPowerScore(wpm, accuracyPercent)
    onComplete({ wpm, accuracyPercent, score, selectedSet })
  }

  if (selectedSet === null) return null

  const progressPercent = words.length === 0 ? 100 : Math.round(((wordIndex + 1) / words.length) * 100)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center gap-6 px-6 py-12 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Guiding Line Pacer™</p>

      {phase === 'reading' && (
        <div className="flex w-full flex-1 flex-col items-center gap-6">
          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>

          <div ref={containerRef} className="relative max-w-xl text-left text-lg leading-relaxed text-foreground">
            {barPosition !== null && (
              <div
                className="absolute left-0 w-full rounded-full bg-primary transition-[top] duration-300 ease-out"
                style={{ top: barPosition.top, height: barPosition.height }}
                aria-hidden="true"
              />
            )}
            <p>
              {words.map((word, index) => (
                <span
                  key={index}
                  ref={(el) => {
                    if (el) wordRefs.current.set(index, el)
                    else wordRefs.current.delete(index)
                  }}
                  className={index === wordIndex ? 'rounded bg-primary/20 px-0.5' : index < wordIndex ? 'text-muted-foreground/50' : undefined}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent/20"
            >
              {isPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
              {isPaused ? 'Resume Pacer' : 'Pause Pacer'}
            </button>
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-1.5">
            <label htmlFor="guiding-line-wpm-slider" className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Speed: {targetWpm} WPM
            </label>
            <input
              id="guiding-line-wpm-slider"
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
