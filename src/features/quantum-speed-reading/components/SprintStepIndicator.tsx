import { cn } from '@/lib/utils'

type SprintStep = 1 | 2 | 3 | 4 | 5

type SprintStepIndicatorProps = {
  currentStep: SprintStep
}

const STEPS: readonly { step: SprintStep; label: string }[] = [
  { step: 1, label: 'Landing' },
  { step: 2, label: 'Mode' },
  { step: 3, label: 'Passage' },
  { step: 4, label: 'Prepare' },
  { step: 5, label: 'Reading' },
]

// Extends this flow's existing plain "Step X of Y" text convention with a
// minimal, neutral-toned dot/line progress row — no new stepper primitive
// exists in this codebase, so this stays local to Quantum Speed Reading's
// session-setup flow rather than becoming a generic ui/ component.
export function SprintStepIndicator({ currentStep }: SprintStepIndicatorProps): React.JSX.Element {
  const currentLabel = STEPS.find((s) => s.step === currentStep)?.label ?? ''

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center">
        {STEPS.map(({ step, label }, i) => (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  'h-px w-8 transition-colors duration-300 sm:w-12',
                  step <= currentStep ? 'bg-foreground/30' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'size-1.5 rounded-full transition-all duration-300',
                  step === currentStep
                    ? 'size-2 bg-foreground'
                    : step < currentStep
                      ? 'bg-foreground/40'
                      : 'bg-border',
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'hidden text-[10px] tracking-wide transition-colors duration-300 sm:block',
                  step === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground/60',
                )}
              >
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground sm:hidden" aria-hidden="true">
        Step {currentStep} of 5 · {currentLabel}
      </p>
      <p className="sr-only" role="status">
        Step {currentStep} of 5: {currentLabel}
      </p>
    </div>
  )
}
