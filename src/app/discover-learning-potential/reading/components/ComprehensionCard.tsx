'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ComprehensionQuestion } from '@/features/reading-discovery/types'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type ComprehensionCardProps = {
  question: ComprehensionQuestion
  onSelect: (optionId: string) => void
  headerSlot?: React.ReactNode
}

// Reusable single-choice question screen — used for Quick Look's "which
// word did you just see?" and Understand's "what was the main idea?".
// Selecting an option immediately continues — no separate CTA — and never
// shows correct/wrong.
export function ComprehensionCard({ question, onSelect, headerSlot }: ComprehensionCardProps): React.JSX.Element {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  function handleSelect(optionId: string): void {
    if (selectedOptionId !== null) return
    setSelectedOptionId(optionId)
    onSelect(optionId)
  }

  return (
    <ReadingExperimentLayout maxWidthClassName="max-w-lg" headerSlot={headerSlot}>
      <p className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">{question.prompt}</p>
      <div className="mt-8 flex flex-col gap-3">
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              aria-pressed={selected}
              disabled={selectedOptionId !== null}
              className={cn(
                'rounded-full border px-5 py-3 text-center text-sm font-medium transition-colors duration-200',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card/60 text-foreground hover:bg-muted disabled:opacity-60',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </ReadingExperimentLayout>
  )
}
