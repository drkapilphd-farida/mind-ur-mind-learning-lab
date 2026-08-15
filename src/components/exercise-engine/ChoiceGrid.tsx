'use client'

// ChoiceGrid — universal 2×2 multiple-choice answer grid.
// Extracted from FlashCanvas.tsx and made exercise-agnostic.
// Used by UniversalExercisePlayer; also available to any future exercise
// that needs a multiple-choice response UI.

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { FitText } from '@/components/typography/FitText'
import { playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

type ChoiceGridProps = {
  options: string[]               // exactly 4 options
  correctIndex: number
  onSelect: (index: number) => void
  // State — provided by the runtime after selection
  selectedIndex: number | null
  isFeedback: boolean             // true during the brief correct/wrong highlight
  // Optional custom renderer for icon-based exercises
  renderOption?: (option: string, index: number) => React.ReactNode
  disabled?: boolean
  // Optional copy override — additive, defaults to the existing text for
  // every exercise that doesn't pass it.
  promptLabel?: string
}

export function ChoiceGrid({
  options,
  correctIndex,
  onSelect,
  selectedIndex,
  isFeedback,
  renderOption,
  disabled = false,
  promptLabel = 'What did you see?',
}: ChoiceGridProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  // Keyboard shortcuts 1–4
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (disabled || isFeedback) return
      const num = Number(e.key)
      if (num >= 1 && num <= 4) onSelect(num - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, isFeedback, onSelect])

  // Immersive Micro-Interactions™ — fires exactly once per feedback
  // window, on the rising edge of isFeedback (never on every re-render
  // while it's already true), so every consumer of this universal grid
  // (UniversalExercisePlayer and any future exercise) gets a correct/miss
  // chime for free without wiring it at each call site. Gated by the
  // Global Sound Preference™ inside playCorrectChime/playGentleMissChime
  // themselves.
  const wasFeedbackRef = useRef(false)
  useEffect(() => {
    if (isFeedback && !wasFeedbackRef.current) {
      if (selectedIndex === correctIndex) playCorrectChime()
      else playGentleMissChime()
    }
    wasFeedbackRef.current = isFeedback
  }, [isFeedback, selectedIndex, correctIndex])

  return (
    <div className="w-full space-y-3">
      <p className="text-center text-sm text-muted-foreground" aria-hidden="true">
        {promptLabel}
      </p>
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Choose your answer">
        {options.map((option, idx) => {
          const isSelected = selectedIndex === idx
          const isThisCorrect = isFeedback && idx === correctIndex
          const isThisWrong = isFeedback && isSelected && !isThisCorrect

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={disabled || isFeedback}
              aria-label={`Option ${idx + 1}: ${option}`}
              aria-pressed={isSelected}
              className={cn(
                'flex min-h-[68px] items-center justify-center rounded-xl border px-4 py-3',
                'text-base font-medium transition-all duration-150 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                !isFeedback && !disabled
                  ? 'border-border bg-card text-foreground hover:bg-muted hover:border-foreground/20 active:scale-95'
                  : isThisCorrect
                    ? `border-success bg-success/10 text-success ${prefersReducedMotion ? '' : 'scale-105'}`
                    : isThisWrong
                      ? `border-destructive bg-destructive/10 text-destructive ${prefersReducedMotion ? '' : 'animate-shake'}`
                      : 'border-border bg-card text-muted-foreground opacity-50',
              )}
            >
              <span className="mr-2 text-[10px] text-muted-foreground" aria-hidden="true">{idx + 1}</span>
              {renderOption ? renderOption(option, idx) : <FitText text={option} role="option" />}
            </button>
          )
        })}
      </div>
      <p className="text-center text-[10px] text-muted-foreground" aria-hidden="true">
        Press 1 · 2 · 3 · 4 or tap to choose
      </p>
    </div>
  )
}
