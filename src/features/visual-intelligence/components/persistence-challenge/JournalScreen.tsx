'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type JournalScreenProps = {
  onContinue: (notes: string | null) => void
}

// Optional, never required — Continue is always enabled regardless of
// whether anything was typed.
export function JournalScreen({ onContinue }: JournalScreenProps): React.JSX.Element {
  const [notes, setNotes] = useState('')
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  const handleContinue = (): void => {
    const trimmed = notes.trim()
    onContinue(trimmed.length > 0 ? trimmed : null)
  }

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Observation Journal</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Anything else you noticed?</h1>
      </div>

      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Describe anything else you observed. Optional."
        className="w-full"
        aria-label="Observation journal notes (optional)"
      />

      <Button
        size="lg"
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  )
}
