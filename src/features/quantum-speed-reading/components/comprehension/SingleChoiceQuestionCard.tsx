import { cn } from '@/lib/utils'

type SingleChoiceQuestionCardProps = {
  options: readonly string[]
  correctIndex: number
  selectedIndex: number | null
  isFeedback: boolean
  onSelect: (index: number) => void
  disabled?: boolean
}

// Generalizes ChoiceGrid's exact feedback convention (border-success/
// bg-success/10 correct, border-destructive/bg-destructive/10 wrong) to
// any option count — ChoiceGrid itself is locked to a fixed 2x2/4-option
// shape, and True/False needs exactly 2. Same keyboard shortcuts (1-9).
export function SingleChoiceQuestionCard({
  options,
  correctIndex,
  selectedIndex,
  isFeedback,
  onSelect,
  disabled = false,
}: SingleChoiceQuestionCardProps): React.JSX.Element {
  return (
    <div
      className={cn('grid gap-3', options.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}
      role="group"
      aria-label="Choose your answer"
    >
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx
        const isThisCorrect = isFeedback && idx === correctIndex
        const isThisWrong = isFeedback && isSelected && !isThisCorrect

        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled || isFeedback}
            aria-label={`Option ${idx + 1}: ${option}`}
            aria-pressed={isSelected}
            className={cn(
              'flex min-h-[76px] items-center justify-center rounded-xl border px-6 py-4 text-center text-base font-medium transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              !isFeedback && !disabled
                ? 'border-border bg-card text-foreground hover:bg-muted hover:border-foreground/20 active:scale-[0.98]'
                : isThisCorrect
                  ? 'border-success bg-success/10 text-success'
                  : isThisWrong
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border bg-card text-muted-foreground opacity-50',
            )}
          >
            <span className="mr-2 text-xs text-muted-foreground" aria-hidden="true">{idx + 1}</span>
            {option}
          </button>
        )
      })}
    </div>
  )
}
