'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

type Option = { id: string; label: string }

type Props = {
  question: string
  options?: Option[]
}

export function QuestionCard({ question, options = [] }: Props): React.JSX.Element {
  return (
    <section className="rounded-2xl border bg-card p-6" aria-live="polite">
      <h3 className="text-lg font-semibold">{question}</h3>

      <div className="mt-4 grid gap-3">
        {options.length > 0 ? (
          options.map((o) => (
            <button key={o.id} className="rounded-lg border px-4 py-3 text-left hover:bg-muted" aria-pressed="false">
              {o.label}
            </button>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">This question type is a placeholder for interactive inputs.</div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost">Previous</Button>
        <Button>Next</Button>
      </div>
    </section>
  )
}

export default QuestionCard
