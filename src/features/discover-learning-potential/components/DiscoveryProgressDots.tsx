import { cn } from '@/lib/utils'
import type { DiscoveryStageId } from '../types'
import { DISCOVERY_STAGE_ORDER } from '../types'

// The 5 real outer-journey stages a learner moves through, excluding
// 'welcome' (the marketing landing screen before the journey begins).
const JOURNEY_STAGES: readonly DiscoveryStageId[] = DISCOVERY_STAGE_ORDER.filter((stage) => stage !== 'welcome')

type DiscoveryProgressDotsProps = {
  currentStage: DiscoveryStageId
}

// Premium Mobile Polish — Part 8. Deliberately shown only on each
// module's own calm welcome/intro screen (who-is-learning, Reading's
// `IntroCard`, Memory's `WelcomeCard`, Focus's `WelcomeScreen`, the AI
// Profile reveal) — never inside the actual exercises/scenes.
// `ReadingExperimentLayout.tsx`'s own documented rule ("No progress
// indicator, no timer, no step count... per the brief 'no progress
// bars, no percentages'") governs the *inside* of each Discovery
// module's real exercises and stays untouched; this is a coarser,
// separate concept — "where am I in the whole 5-stage journey," shown
// only at each journey hand-off. Real position, computed from the same
// real `DISCOVERY_STAGE_ORDER` the rest of this feature already uses —
// never a fabricated or guessed count.
export function DiscoveryProgressDots({ currentStage }: DiscoveryProgressDotsProps): React.JSX.Element {
  const currentIndex = JOURNEY_STAGES.indexOf(currentStage)

  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Step ${currentIndex + 1} of ${JOURNEY_STAGES.length}`}>
      {JOURNEY_STAGES.map((stage, index) => (
        <span key={stage} aria-hidden="true" className={cn('size-1.5 rounded-full transition-colors duration-(--duration-base)', index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/25')} />
      ))}
    </div>
  )
}
