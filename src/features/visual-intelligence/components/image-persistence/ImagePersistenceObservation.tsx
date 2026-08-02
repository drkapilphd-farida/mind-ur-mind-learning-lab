'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { ObservationResponse } from '../../image-persistence/imagePersistenceTypes'

type ImagePersistenceObservationProps = {
  onSubmit: (response: ObservationResponse | null, notes: string | null) => void
}

const OPTIONS: readonly { value: ObservationResponse; label: string }[] = [
  { value: 'clearly-saw', label: 'I clearly saw it.' },
  { value: 'noticed-details', label: 'I noticed some details.' },
  { value: 'light-patterns', label: 'I only saw light patterns.' },
  { value: 'nothing-yet', label: 'Nothing yet.' },
]

// Sprint-3B — premium selectable cards, replacing Sprint-3A's plain
// RadioGroup. Kept low-friction and calm on purpose: neither the card
// selection nor the notes field is required, and no option is framed as a
// "better" or "worse" outcome — "Nothing yet." is as valid a result as any
// other.
export function ImagePersistenceObservation({ onSubmit }: ImagePersistenceObservationProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [selected, setSelected] = useState<ObservationResponse | null>(null)
  const [notes, setNotes] = useState('')

  const handleSkip = (): void => onSubmit(null, null)
  const handleContinue = (): void => onSubmit(selected, notes.trim().length > 0 ? notes.trim() : null)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reflection</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Did you notice any visual impression?
        </h1>
      </div>

      <div className="grid w-full grid-cols-1 gap-3" role="radiogroup" aria-label="Observation response">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(option.value)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-medium shadow-sm',
                !prefersReducedMotion && 'transition-colors duration-150',
                isSelected
                  ? 'border-primary bg-primary/[0.06] text-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted/60',
              )}
            >
              {option.label}
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20',
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="size-3.5" />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        <Label htmlFor="observation-notes" className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Notes (optional)
        </Label>
        <Textarea
          id="observation-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what you noticed, if anything..."
          className="mt-2 min-h-[80px]"
        />
      </div>

      <div className="flex w-full gap-3">
        <Button
          variant="ghost"
          size="lg"
          className={cn('flex-1 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button
          size="lg"
          className={cn('flex-1 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
