'use client'

import { Check } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export type OnboardingJourneyStepId = 'welcome' | 'goal' | 'method' | 'thinking' | 'blueprint'

type OnboardingJourneyIndicatorProps = {
  currentStepId: OnboardingJourneyStepId
  className?: string
}

const JOURNEY_STEPS: readonly { id: OnboardingJourneyStepId; label: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'goal', label: 'Goal' },
  { id: 'method', label: 'Learning Method' },
  { id: 'thinking', label: 'AI Thinking' },
  { id: 'blueprint', label: 'Blueprint' },
]

// Matches AIPresenceLogo/ArrivalBackground's one reused accent — no new
// hue introduced for the "current step" glow.
const CURRENT_GLOW_COLOR = '#4FE0FF'

// Onboarding Journey Indicator™ (Sprint LW-1C.3) — "instead of generic
// progress bars, display a premium journey indicator." A fixed 5-waypoint
// map of the locked onboarding flow, purely presentational — no step here
// writes anything or drives navigation; each screen just tells it where
// the user currently is.
export function OnboardingJourneyIndicator({ currentStepId, className }: OnboardingJourneyIndicatorProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const currentIndex = JOURNEY_STEPS.findIndex((step) => step.id === currentStepId)

  return (
    <nav aria-label="Onboarding progress" className={className}>
      <ol className="flex items-center justify-center">
        {JOURNEY_STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === JOURNEY_STEPS.length - 1

          return (
            <li key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
              <div className="flex flex-col items-center gap-1.5">
                <span className="relative flex size-5 items-center justify-center" aria-current={isCurrent ? 'step' : undefined}>
                  {isCurrent && !prefersReducedMotion && (
                    <span className="absolute inset-0 rounded-full blur-[6px]" style={{ backgroundColor: CURRENT_GLOW_COLOR, opacity: 0.5 }} aria-hidden="true" />
                  )}
                  <span
                    className={cn(
                      'relative flex size-2.5 items-center justify-center rounded-full transition-colors duration-300',
                      isComplete && 'bg-foreground/70',
                      isCurrent && 'size-3 bg-foreground',
                      !isComplete && !isCurrent && 'border border-muted-foreground/30 bg-transparent',
                    )}
                  >
                    {isComplete && <Check className="size-2 text-background" strokeWidth={3} aria-hidden="true" />}
                  </span>
                </span>
                <span className={cn(TYPOGRAPHY.caption, 'hidden whitespace-nowrap sm:inline', isCurrent ? 'text-foreground' : 'text-muted-foreground/60')}>
                  {step.label}
                </span>
              </div>

              {!isLast && <span className={cn('mx-2 h-px flex-1 transition-colors duration-300', isComplete ? 'bg-foreground/40' : 'bg-muted-foreground/20')} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
