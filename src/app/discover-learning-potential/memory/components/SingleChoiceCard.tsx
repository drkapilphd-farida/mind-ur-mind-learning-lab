'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ChoiceQuestion } from '@/features/memory-discovery/types'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

type SingleChoiceCardProps = {
  question: ChoiceQuestion
  onSelect: (optionId: string) => void
}

// Shared single-choice recognition screen — used for Sentence Recall™ and
// Number Memory™. Selecting an option immediately continues — no separate
// CTA — and never shows correct/wrong.
export function SingleChoiceCard({ question, onSelect }: SingleChoiceCardProps): React.JSX.Element {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  function handleSelect(optionId: string): void {
    if (selectedOptionId !== null) return
    setSelectedOptionId(optionId)
    onSelect(optionId)
  }

  return (
    <MemoryExperimentLayout maxWidthClassName="max-w-lg">
      <p className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">{question.prompt}</p>
      <div className="mt-8 flex flex-col gap-3">
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              aria-pressed={selected}
              disabled={selectedOptionId !== null}
              whileTap={{ scale: 0.94 }}
              className={cn(
                'rounded-full border px-5 py-3 text-center text-sm font-medium transition-colors duration-200',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card/60 text-foreground hover:bg-muted disabled:opacity-60',
              )}
            >
              {option.label}
            </motion.button>
          )
        })}
      </div>
    </MemoryExperimentLayout>
  )
}
