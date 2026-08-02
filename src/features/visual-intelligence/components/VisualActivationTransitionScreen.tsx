import { EXERCISE_SCREEN_CLASSNAME } from '@/components/exercises/exerciseStyles'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'

type VisualActivationTransitionScreenProps = {
  stepIndex: number
  totalSteps: number
}

// Sprint-13 — Micro Victory System™. Mirrors
// ReadingPreparationTransitionScreen.tsx's exact shape (a small, automatic,
// no-click hand-off) — this was the one real gap the audit found: Visual
// Activation™ previously jumped straight from Breath Awareness into Eye
// Relaxation with zero acknowledgment. Only used between the two
// standalone screens (Breath Awareness, Eye Relaxation) — the Tratak
// family (Mandala/Image Persistence/Candle) already show their own
// report screen and an explicit "Continue Journey" click before
// advancing, so an extra forced pause there would be friction, not reward.
export function VisualActivationTransitionScreen({ stepIndex, totalSteps }: VisualActivationTransitionScreenProps): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <MicroVictoryMoment progressLabel={`Step ${stepIndex} of ${totalSteps}`} />
    </div>
  )
}
