import { cn } from '@/lib/utils'

type JourneyProgressDotsProps = {
  totalSteps: number
  currentStepIndex: number
}

// Reading Journey Experience™ (Sprint-5). "The learner should always
// know where they are and what comes next" — without ever surfacing
// technical vocabulary (no "Stage 3 of 6"). A quiet row of dots
// communicates real position/total steps at a glance, calmly.
export function JourneyProgressDots({ totalSteps, currentStepIndex }: JourneyProgressDotsProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-1.5" role="presentation">
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={cn('h-1.5 rounded-full transition-all duration-(--duration-base)', index === currentStepIndex ? 'w-6 bg-primary' : index < currentStepIndex ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted')}
        />
      ))}
    </div>
  )
}
