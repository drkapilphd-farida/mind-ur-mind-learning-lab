'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import {
  AFTER_IMAGE_CLARITY_OPTIONS,
  AFTER_IMAGE_DURATION_OPTIONS,
  CENTER_FOCUS_EASE_OPTIONS,
  GAZE_STABILITY_OPTIONS,
  type AfterImageClarity,
  type AfterImageDuration,
  type CenterFocusEase,
  type GazeStability,
  type ImageFixationAnalyzerAnswers,
} from './imageFixationReflection'

type OptionGridProps<T extends string> = {
  questionNumber: number
  question: string
  options: readonly { value: T; label: string }[]
  value: T | null
  onSelect: (value: T) => void
}

function OptionGrid<T extends string>({ questionNumber, question, options, value, onSelect }: OptionGridProps<T>): React.JSX.Element {
  return (
    <div className="w-full text-left">
      <p className="text-sm font-semibold text-foreground">
        {questionNumber}. {question}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={question}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'flex min-h-[52px] items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-medium transition-all duration-150',
              'hover:bg-muted hover:border-foreground/20 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              value === option.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

type IntelligentFocusAnalyzerScreenProps = {
  onContinue: (answers: ImageFixationAnalyzerAnswers) => void
}

// The Intelligent Focus Analyzer™ — a generic, mission-agnostic 5-question
// guided assessment (4 multiple-choice + optional notes), replacing the
// simpler single-question reflection from Sprint-10B. Reused verbatim by
// any future image-fixation mission — nothing here is Mandala-specific.
export function IntelligentFocusAnalyzerScreen({ onContinue }: IntelligentFocusAnalyzerScreenProps): React.JSX.Element {
  const [gazeStability, setGazeStability] = useState<GazeStability | null>(null)
  const [afterImageClarity, setAfterImageClarity] = useState<AfterImageClarity | null>(null)
  const [afterImageDuration, setAfterImageDuration] = useState<AfterImageDuration | null>(null)
  const [centerFocusEase, setCenterFocusEase] = useState<CenterFocusEase | null>(null)
  const [notes, setNotes] = useState('')
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  const canContinue = gazeStability !== null && afterImageClarity !== null && afterImageDuration !== null && centerFocusEase !== null

  const handleContinue = (): void => {
    if (!canContinue || gazeStability === null || afterImageClarity === null || afterImageDuration === null || centerFocusEase === null) return
    const trimmed = notes.trim()
    onContinue({
      gazeStability,
      afterImageClarity,
      afterImageDuration,
      centerFocusEase,
      notes: trimmed.length > 0 ? trimmed : null,
    })
  }

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Intelligent Focus Analyzer™</p>
        <h1 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">Guided Session Assessment</h1>
      </div>

      <div className="w-full space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
        <OptionGrid
          questionNumber={1}
          question="How stable was your gaze?"
          options={GAZE_STABILITY_OPTIONS}
          value={gazeStability}
          onSelect={setGazeStability}
        />
        <OptionGrid
          questionNumber={2}
          question="How clearly did you notice the after-image?"
          options={AFTER_IMAGE_CLARITY_OPTIONS}
          value={afterImageClarity}
          onSelect={setAfterImageClarity}
        />
        <OptionGrid
          questionNumber={3}
          question="How long did the after-image remain?"
          options={AFTER_IMAGE_DURATION_OPTIONS}
          value={afterImageDuration}
          onSelect={setAfterImageDuration}
        />
        <OptionGrid
          questionNumber={4}
          question="Did the center remain easy to focus on?"
          options={CENTER_FOCUS_EASE_OPTIONS}
          value={centerFocusEase}
          onSelect={setCenterFocusEase}
        />
      </div>

      <div className="w-full text-left">
        <p className="text-sm font-semibold text-foreground">5. Optional Notes</p>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What did you notice during this session?"
          className="mt-2 w-full"
          aria-label="What did you notice during this session (optional)"
        />
      </div>

      <Button
        size="lg"
        disabled={!canContinue}
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  )
}
