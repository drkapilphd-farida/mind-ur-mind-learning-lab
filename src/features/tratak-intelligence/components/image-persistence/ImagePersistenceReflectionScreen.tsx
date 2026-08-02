'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { secondsToAfterImageDurationBucket, type AfterImageClarity, type ImageFixationAnalyzerAnswers } from '../../imageFixation/imageFixationReflection'

// Sprint 52 — non-judgmental, first-person self-report copy ("no right or
// wrong answer"), distinct from the shared IntelligentFocusAnalyzerScreen's
// labels ("Very Clear/Moderate/..") still used by Mandala Tratak™ — mapped
// onto the exact same underlying AfterImageClarity enum/scoring, just a
// local presentation choice.
const CLARITY_OPTIONS: readonly { value: AfterImageClarity; label: string }[] = [
  { value: 'very-clear', label: 'I clearly saw the after-image.' },
  { value: 'moderate', label: 'I saw it fairly clearly.' },
  { value: 'faint', label: 'I saw it briefly.' },
  { value: 'none', label: "I didn't notice it." },
]

type ImagePersistenceReflectionScreenProps = {
  // The REAL measured seconds from the 2-tap timer — used to honestly
  // derive the stored duration bucket, never guessed.
  measuredAfterImageDurationSeconds: number
  onContinue: (answers: ImageFixationAnalyzerAnswers) => void
}

// Sprint 10F enhancement: 1-question simplified reflection — a small local
// duplicate, NOT the shared imageFixation/IntelligentFocusAnalyzerScreen.tsx
// Mandala Tratak™ still uses unchanged (its own 4-question flow).
export function ImagePersistenceReflectionScreen({ measuredAfterImageDurationSeconds, onContinue }: ImagePersistenceReflectionScreenProps): React.JSX.Element {
  const [clarity, setClarity] = useState<AfterImageClarity | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  const handleContinue = (): void => {
    if (clarity === null) return
    onContinue({
      gazeStability: null,
      afterImageClarity: clarity,
      afterImageDuration: secondsToAfterImageDurationBucket(measuredAfterImageDurationSeconds),
      centerFocusEase: null,
      notes: null,
    })
  }

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reflection</p>
        <h1 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">What did you notice?</h1>
        <p className="mt-1 text-sm text-muted-foreground">There&rsquo;s no right or wrong answer — just what you actually experienced.</p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2" role="group" aria-label="What did you notice?">
        {CLARITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setClarity(option.value)}
            aria-pressed={clarity === option.value}
            className={cn(
              'flex min-h-[56px] items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-medium transition-all duration-150',
              'hover:bg-muted hover:border-foreground/20 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              clarity === option.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        disabled={clarity === null}
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  )
}
