import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type MultiSelectQuestionCardProps = {
  options: readonly string[]
  correctIndices: readonly number[]
  selectedIndices: readonly number[]
  isFeedback: boolean
  onToggle: (index: number) => void
  onSubmit: () => void
  disabled?: boolean
}

// Select-multiple needs explicit confirmation (unlike single-choice's
// instant tap-to-answer) since a learner may want to change their mind
// across several selections before committing.
export function MultiSelectQuestionCard({
  options,
  correctIndices,
  selectedIndices,
  isFeedback,
  onToggle,
  onSubmit,
  disabled = false,
}: MultiSelectQuestionCardProps): React.JSX.Element {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-3" role="group" aria-label="Select all that apply">
        {options.map((option, idx) => {
          const isSelected = selectedIndices.includes(idx)
          const isCorrectAnswer = correctIndices.includes(idx)
          const isThisWrong = isFeedback && isSelected && !isCorrectAnswer
          const isThisMissed = isFeedback && !isSelected && isCorrectAnswer
          const isThisRight = isFeedback && isSelected && isCorrectAnswer

          return (
            <button
              key={idx}
              onClick={() => onToggle(idx)}
              disabled={disabled || isFeedback}
              aria-pressed={isSelected}
              className={cn(
                'flex min-h-[64px] items-center gap-3 rounded-xl border px-5 py-3 text-left text-base font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                !isFeedback
                  ? isSelected
                    ? 'border-primary bg-primary/[0.06] text-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-foreground/20'
                  : isThisRight
                    ? 'border-success bg-success/10 text-success'
                    : isThisWrong
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : isThisMissed
                        ? 'border-warning bg-warning/10 text-warning'
                        : 'border-border bg-card text-muted-foreground opacity-50',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md border',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20',
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="size-3.5" />}
              </span>
              {option}
            </button>
          )
        })}
      </div>
      {!isFeedback && (
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={selectedIndices.length === 0 || disabled}
          onClick={onSubmit}
        >
          Submit Answer
        </Button>
      )}
    </div>
  )
}
