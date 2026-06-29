import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  EXERCISE_BODY_CLASSNAME,
  EXERCISE_CAPTION_CLASSNAME,
  EXERCISE_SCREEN_CLASSNAME,
  EXERCISE_TITLE_CLASSNAME,
} from './exerciseStyles'

type ExerciseIntroScreenProps = {
  title: string
  description: string
  durationLabel: string
  postureNote: string
  onStart: () => void
}

export function ExerciseIntroScreen({
  title,
  description,
  durationLabel,
  postureNote,
  onStart,
}: ExerciseIntroScreenProps): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div className="mx-auto max-w-sm">
        <h1 className={EXERCISE_TITLE_CLASSNAME}>{title}</h1>
        <p className={cn('mt-4', EXERCISE_BODY_CLASSNAME)}>{description}</p>

        <p className={cn('mt-8', EXERCISE_CAPTION_CLASSNAME)}>{durationLabel}</p>
        <p className={cn('mt-2', EXERCISE_CAPTION_CLASSNAME)}>{postureNote}</p>

        <Button size="lg" className="mt-10 min-w-[200px] rounded-full shadow-sm" onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  )
}
