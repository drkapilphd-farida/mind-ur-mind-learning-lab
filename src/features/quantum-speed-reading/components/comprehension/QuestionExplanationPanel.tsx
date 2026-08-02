import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

type QuestionExplanationPanelProps = {
  isCorrect: boolean
  explanation: string
}

// Shown after every answer — no precedent for an explanation panel exists
// anywhere in this app (confirmed via research), so this is new, matching
// the same border-success/border-destructive convention as the choice
// cards themselves for visual consistency.
export function QuestionExplanationPanel({ isCorrect, explanation }: QuestionExplanationPanelProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left',
        !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-2 duration-300',
        isCorrect ? 'border-success bg-success/[0.06]' : 'border-destructive bg-destructive/[0.06]',
      )}
      role="status"
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full',
          isCorrect ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
        )}
        aria-hidden="true"
      >
        {isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      </span>
      <div>
        <p className={cn('text-sm font-semibold', isCorrect ? 'text-success' : 'text-destructive')}>
          {isCorrect ? 'Correct' : 'Not quite'}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{explanation}</p>
      </div>
    </div>
  )
}
