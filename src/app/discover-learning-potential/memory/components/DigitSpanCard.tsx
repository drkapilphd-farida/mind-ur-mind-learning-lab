'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDigitsForDisplay, generateDigitSpanDecoys, type DigitSpanResult, type DigitSpanRound } from '@/features/memory-discovery/digitSpan'
import { pickRoundFeedback } from '@/features/memory-discovery/pickRoundFeedback'
import { clampDigitSpanMultiplier, nextPerformanceMultiplier } from '@/features/memory-discovery/adaptiveTiming'
import { DIGIT_SPAN_FEEDBACK_DISPLAY_MS, DIGIT_SPAN_OBSERVATION_MS, DIGIT_SPAN_PULSE_FADE_MS } from '@/features/memory-discovery/memoryTimingConfig'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { ChoiceQuestion } from '@/features/memory-discovery/types'
import { SingleChoiceCard } from './SingleChoiceCard'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

export type { DigitSpanResult } from '@/features/memory-discovery/digitSpan'

type DigitSpanCardProps = {
  rounds: readonly DigitSpanRound[]
  onDone: (result: DigitSpanResult) => void
  // Sprint-2.1 FIX-03 — Reading-Speed Awareness, computed once per
  // session by the orchestrator (`computeReadingSpeedMultiplier`) and
  // handed down here; defaults to 1 (no adjustment) when Reading
  // Discovery data is unavailable.
  adaptiveMultiplier?: number
  // Sprint-3 FIX-01/FIX-06 — Adaptive Memory Coach™: fires the moment
  // each real round's own answer is known (well before the whole
  // mission finishes), so the session-wide coach gets real, continuous,
  // round-by-round evidence — not just one aggregate at the very end.
  onRoundOutcome?: (wasCorrect: boolean, reactionMs: number) => void
}

const DECOYS_PER_ROUND = 3
const NUMBER_MEMORY_PROMPT = 'What number feels familiar?'

// Number Memory Exposure Engine™ (Sprint-4.1) FIX-02/FIX-08 — the real
// production table is always the baseline; `performanceMultiplier`
// (this component's own real, gradually-adjusted state) and the
// session-wide `adaptiveMultiplier` (Reading-Speed Awareness) both apply
// on top, but their COMBINED effect is clamped to Number Memory's own
// tighter real ±15% band (`clampDigitSpanMultiplier`) — never the
// shared ±20% band every other mission uses.
function flashDurationForRound(length: number, adaptiveMultiplier: number, performanceMultiplier: number): number {
  const baseMs = DIGIT_SPAN_OBSERVATION_MS[length] ?? Math.round(DIGIT_SPAN_OBSERVATION_MS[8]! + (length - 8) * 200)
  return Math.round(baseMs * clampDigitSpanMultiplier(adaptiveMultiplier * performanceMultiplier))
}

type DigitPulseRevealProps = {
  digits: string
  durationMs: number
  onHide: () => void
}

// FIX-03 Pulse Reveal™ / FIX-04/FIX-05 Instant Recall Rule™ — a real,
// dedicated presentation for Number Memory only (never touching the
// shared `SequentialFlashCard`, which other missions' real multi-item
// RSVP sequences still need their own inter-item gap for). Soft fade in
// → hold → soft fade out → `onHide` fires at the EXACT end of the real
// observation window, with no ready-pulse, gap, or post-sequence pause
// added anywhere — the recall screen the caller renders next appears
// immediately, preserving one uninterrupted cognitive loop.
function DigitPulseReveal({ digits, durationMs, onHide }: DigitPulseRevealProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const fadeMs = prefersReducedMotion ? 0 : DIGIT_SPAN_PULSE_FADE_MS
    const fadeOutTimer = window.setTimeout(() => setVisible(false), Math.max(durationMs - fadeMs, 0))
    const hideTimer = window.setTimeout(onHide, durationMs)
    return () => {
      window.clearTimeout(fadeOutTimer)
      window.clearTimeout(hideTimer)
    }
  }, [digits, durationMs, onHide, prefersReducedMotion])

  return (
    <MemoryExperimentLayout maxWidthClassName="max-w-lg">
      <div className="flex min-h-[140px] items-center justify-center">
        <motion.p
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: (prefersReducedMotion ? 0 : DIGIT_SPAN_PULSE_FADE_MS) / 1000, ease: 'easeInOut' }}
          className="font-mono text-6xl tracking-widest text-foreground sm:text-7xl"
          aria-live="assertive"
          aria-label={`Number: ${digits}`}
        >
          {digits}
        </motion.p>
      </div>
    </MemoryExperimentLayout>
  )
}

// Memory Discovery™ Digit Span™ — Sprint-1.5 FIX-02, retimed for
// Sprint-1.6/Sprint-2.1's continuous-rhythm goals. Runs the real,
// progressive multi-round sequence (Flash → Recognize → Feedback, length
// increasing every round) entirely inside one self-contained component,
// so the outer orchestrator's own scene machine only ever sees ONE real
// "Number Memory" scene. Sprint-2.1 FIX-04 adds real, in-session
// Performance-Based Timing: a running real multiplier nudges every
// subsequent round's observation duration a small step faster after a
// real correct answer, slower after a real miss.
export function DigitSpanCard({ rounds, onDone, adaptiveMultiplier = 1, onRoundOutcome }: DigitSpanCardProps): React.JSX.Element {
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<'flash' | 'choice' | 'feedback'>('flash')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const resultRef = useRef<DigitSpanResult>({ roundsCompleted: 0, correctCount: 0, longestCorrectLength: 0, totalRecognitionMs: 0 })
  const questionShownAtRef = useRef(0)
  const performanceMultiplierRef = useRef(1)

  const round = rounds[roundIndex]!

  // Sprint-4 FIX-05 — the correct answer AND every decoy are formatted
  // with the round's own real digit style (`grouped`/`mixed` rounds show
  // real visual chunking, e.g. "12 45") so what the learner compares
  // against matches what was actually flashed, never a differently
  // formatted correct answer among plain-string decoys.
  const question = useMemo<ChoiceQuestion>(() => {
    const decoys = generateDigitSpanDecoys(round, DECOYS_PER_ROUND, roundIndex * 991 + 3)
    const options = shuffleArray(
      [round.digits, ...decoys].map((digits, index) => ({ id: `${roundIndex}-${digits}-${index}`, label: formatDigitsForDisplay(digits, round.style) })),
      roundIndex * 773 + 11,
    )
    return { id: `digit-span-round-${roundIndex}`, prompt: NUMBER_MEMORY_PROMPT, options }
  }, [round, roundIndex])

  const handleFlashDone = useCallback((): void => {
    questionShownAtRef.current = Date.now()
    setPhase('choice')
  }, [])

  const handleSelect = useCallback(
    (optionId: string): void => {
      const label = question.options.find((option) => option.id === optionId)?.label
      const wasCorrect = label === formatDigitsForDisplay(round.digits, round.style)
      const reactionMs = Date.now() - questionShownAtRef.current
      resultRef.current = {
        roundsCompleted: resultRef.current.roundsCompleted + 1,
        correctCount: resultRef.current.correctCount + (wasCorrect ? 1 : 0),
        longestCorrectLength: wasCorrect ? Math.max(resultRef.current.longestCorrectLength, round.length) : resultRef.current.longestCorrectLength,
        totalRecognitionMs: resultRef.current.totalRecognitionMs + reactionMs,
      }
      performanceMultiplierRef.current = nextPerformanceMultiplier(performanceMultiplierRef.current, wasCorrect)
      onRoundOutcome?.(wasCorrect, reactionMs)
      setFeedbackMessage(pickRoundFeedback(wasCorrect, roundIndex, roundIndex * 331 + reactionMs))
      setPhase('feedback')
    },
    [question, round, roundIndex, onRoundOutcome],
  )

  useEffect(() => {
    if (phase !== 'feedback') return
    const timer = window.setTimeout(() => {
      if (roundIndex + 1 >= rounds.length) {
        onDone(resultRef.current)
        return
      }
      setRoundIndex((index) => index + 1)
      setPhase('flash')
    }, DIGIT_SPAN_FEEDBACK_DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [phase, roundIndex, rounds.length, onDone])

  if (phase === 'flash') {
    return (
      <DigitPulseReveal
        key={`digit-span-flash-${roundIndex}`}
        digits={formatDigitsForDisplay(round.digits, round.style)}
        durationMs={flashDurationForRound(round.length, adaptiveMultiplier, performanceMultiplierRef.current)}
        onHide={handleFlashDone}
      />
    )
  }

  if (phase === 'choice') {
    return <SingleChoiceCard key={`digit-span-choice-${roundIndex}`} question={question} onSelect={handleSelect} />
  }

  return (
    <MemoryExperimentLayout key={`digit-span-feedback-${roundIndex}`} maxWidthClassName="max-w-sm">
      <motion.p
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="font-heading text-xl font-semibold text-foreground sm:text-2xl"
      >
        {feedbackMessage}
      </motion.p>
    </MemoryExperimentLayout>
  )
}
