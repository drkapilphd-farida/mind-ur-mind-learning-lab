'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Option = { id: string; label: string }

type Props = {
  question: string
  options?: Option[]
}

// AI Learning Studio™ Sprint ALS-21 — Complete Functional Completion. A
// production audit found this card's answer options and Previous/Next
// controls had no real click handler at all — a genuinely dead
// experience, not disclosed unavailability. Founder-confirmed minimal
// safety fix (not a full rebuild of real scoring/interactivity, which is
// out of this sprint's scope): answer options now give real, honest
// visual feedback on selection (a real `radiogroup`/`radio` pattern,
// local state only — no real scoring exists yet to persist a choice
// against). Previous/Next are honestly disabled rather than silently
// inert, since this page shows a single, real, hardcoded question with
// no real multi-question state to navigate — the same "disable with a
// reason, never fake it" pattern already established elsewhere in this
// app (`SourceTypeCard`, `LearningModeCard`).
export function QuestionCard({ question, options = [] }: Props): React.JSX.Element {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  return (
    <section className="rounded-2xl border bg-card p-6" aria-live="polite">
      <h3 className="text-lg font-semibold">{question}</h3>

      <div className="mt-4 grid gap-3" role={options.length > 0 ? 'radiogroup' : undefined} aria-label={options.length > 0 ? question : undefined}>
        {options.length > 0 ? (
          options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selectedOptionId === o.id}
              onClick={() => setSelectedOptionId(o.id)}
              className={cn(
                'rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedOptionId === o.id ? 'border-primary bg-primary/10' : 'hover:bg-muted',
              )}
            >
              {o.label}
            </button>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">This question type isn&apos;t available yet.</div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost" disabled title="Not available yet">
          Previous
        </Button>
        <Button disabled title="Not available yet">
          Next
        </Button>
      </div>
    </section>
  )
}

export default QuestionCard
