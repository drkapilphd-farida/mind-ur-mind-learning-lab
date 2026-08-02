import { Check } from 'lucide-react'
import { EXERCISE_CAPTION_CLASSNAME, EXERCISE_QUIET_TITLE_CLASSNAME, EXERCISE_SCREEN_CLASSNAME } from '@/components/exercises/exerciseStyles'

type ReadingPreparationTransitionScreenProps = {
  completedTitle: string
  nextTitle: string
}

// The small, automatic, no-click hand-off shown between every Reading
// Preparation™ step — visually consistent with every other exercise screen
// (same shared style tokens) but deliberately quieter, since it's on screen
// for under 1.2s and never waits on user input.
export function ReadingPreparationTransitionScreen({
  completedTitle,
  nextTitle,
}: ReadingPreparationTransitionScreenProps): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div
        aria-hidden="true"
        className="mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10"
      >
        <Check className="size-6 text-primary" />
      </div>
      <h1 className={EXERCISE_QUIET_TITLE_CLASSNAME}>{completedTitle} Trained</h1>
      <p className={EXERCISE_CAPTION_CLASSNAME}>Next: {nextTitle}</p>
    </div>
  )
}
