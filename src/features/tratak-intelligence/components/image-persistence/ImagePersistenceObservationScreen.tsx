'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS } from '../../imagePersistenceObservationQuestions'

type ImagePersistenceObservationScreenProps = {
  imageId: string
  onContinue: (answers: Record<string, string>) => void
  // Sprint-15 — Premium Interaction Review™. Reflects the parent's
  // in-flight completeTratakMissionSession call so Continue never sits
  // silent while it saves.
  isSubmitting?: boolean
}

// Observation Intelligence™ for Image Persistence Challenge™ — mirrors
// ObservationIntelligenceScreen.tsx's exact pattern, keyed by image id
// instead of Mandala level order.
export function ImagePersistenceObservationScreen({ imageId, onContinue, isSubmitting = false }: ImagePersistenceObservationScreenProps): React.JSX.Element {
  const questionSet = IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS[imageId]
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  if (questionSet === undefined) {
    return (
      <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center', fadeClass)}>
        <p className="text-sm text-muted-foreground">No observation questions are registered for this image yet.</p>
        <Button size="lg" className="w-full rounded-full" loading={isSubmitting} onClick={() => onContinue({})}>
          Continue
        </Button>
      </div>
    )
  }

  const canContinue = questionSet.questions.every((question) => answers[question.id] !== undefined)

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Observation Intelligence™</p>
        <h1 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">Observation Challenge</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answer based on what you actually saw — there&rsquo;s no penalty for guessing honestly.</p>
      </div>

      <div className="w-full space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
        {questionSet.questions.map((question, index) => (
          <div key={question.id} className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {index + 1}. {question.text}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={question.text}>
              {question.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                  aria-pressed={answers[question.id] === option.id}
                  className={cn(
                    'flex min-h-[48px] items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-medium transition-all duration-150',
                    'hover:bg-muted hover:border-foreground/20 active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    answers[question.id] === option.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        disabled={!canContinue}
        loading={isSubmitting}
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={() => onContinue(answers)}
      >
        Continue
      </Button>
    </div>
  )
}
