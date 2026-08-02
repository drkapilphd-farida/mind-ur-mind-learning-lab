import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type OrderingQuestionCardProps = {
  options: readonly string[]
  correctOrder: readonly number[]
  order: readonly number[]
  isFeedback: boolean
  onToggle: (index: number) => void
  onSubmit: () => void
  disabled?: boolean
}

// Tap-to-sequence rather than drag-and-drop — no drag precedent exists
// anywhere in this app, and this stays fully accessible via mouse,
// keyboard (tab + enter), and touch with no new dependency. Tapping an
// item appends it to the running order; tapping a placed item again
// removes it (and renumbers the rest).
export function OrderingQuestionCard({
  options,
  correctOrder,
  order,
  isFeedback,
  onToggle,
  onSubmit,
  disabled = false,
}: OrderingQuestionCardProps): React.JSX.Element {
  const isComplete = order.length === options.length

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-center text-xs text-muted-foreground" aria-hidden="true">
        Tap the items in the order they happened
      </p>
      <div className="grid grid-cols-1 gap-3" role="group" aria-label="Arrange in order">
        {options.map((option, idx) => {
          const placementIndex = order.indexOf(idx)
          const isPlaced = placementIndex !== -1
          const isCorrectPlacement = isFeedback && correctOrder[placementIndex] === idx

          return (
            <button
              key={idx}
              onClick={() => onToggle(idx)}
              disabled={disabled || isFeedback}
              aria-pressed={isPlaced}
              className={cn(
                'flex min-h-[64px] items-center gap-3 rounded-xl border px-5 py-3 text-left text-base font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                !isFeedback
                  ? isPlaced
                    ? 'border-primary bg-primary/[0.06] text-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-foreground/20'
                  : isCorrectPlacement
                    ? 'border-success bg-success/10 text-success'
                    : isPlaced
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-border bg-card text-muted-foreground opacity-50',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums',
                  isPlaced ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 text-muted-foreground',
                )}
                aria-hidden="true"
              >
                {isPlaced ? placementIndex + 1 : ''}
              </span>
              {option}
            </button>
          )
        })}
      </div>
      {!isFeedback && (
        <Button size="lg" className="w-full rounded-full" disabled={!isComplete || disabled} onClick={onSubmit}>
          Submit Order
        </Button>
      )}
    </div>
  )
}
