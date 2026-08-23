'use client'

import { cn } from '@/lib/utils'

type QuantumJourneyStageDotsProps = {
  currentStepIndex: number
}

const STEP_LABELS = ['Rapid Recognition Drill', 'Reading Chunks', 'Phrase Reading', 'Sentence Reading', 'Paragraph Reading', 'Reading Sprint', 'Understanding Check'] as const

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 4/12 — a small, calm "where am I in this
// chapter" indicator, never a technical progress bar. Purely
// presentational; reads state the controller already computed, never
// touches the persisted state machine.
export function QuantumJourneyStageDots({ currentStepIndex }: QuantumJourneyStageDotsProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label={`Step ${currentStepIndex + 1} of ${STEP_LABELS.length}: ${STEP_LABELS[currentStepIndex]}`}>
      {STEP_LABELS.map((label, index) => (
        <span
          key={label}
          className={cn('h-1.5 rounded-full transition-all', index === currentStepIndex ? 'w-6 bg-foreground/70' : index < currentStepIndex ? 'w-1.5 bg-foreground/40' : 'w-1.5 bg-muted-foreground/25')}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
