import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EXERCISE_CAPTION_CLASSNAME, EXERCISE_QUIET_TITLE_CLASSNAME, EXERCISE_SCREEN_CLASSNAME } from './exerciseStyles'

type ExerciseCompletionScreenProps = {
  title: string
  mentorLine: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
}

export function ExerciseCompletionScreen({
  title,
  mentorLine,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionHref,
}: ExerciseCompletionScreenProps): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div
        aria-hidden="true"
        className="mb-8 flex size-16 items-center justify-center rounded-full bg-primary/10"
      >
        <div className="size-6 rounded-full bg-primary/40" />
      </div>

      <h1 className={EXERCISE_QUIET_TITLE_CLASSNAME}>{title}</h1>
      <p className={cn('mx-auto mt-4 max-w-xs', EXERCISE_CAPTION_CLASSNAME)}>{mentorLine}</p>

      <Button size="lg" className="mt-10 min-w-[200px] rounded-full shadow-sm" onClick={onPrimaryAction}>
        {primaryActionLabel}
      </Button>

      {secondaryActionHref !== undefined && (
        <Link href={secondaryActionHref} className={cn('mt-6 hover:text-foreground', EXERCISE_CAPTION_CLASSNAME)}>
          {secondaryActionLabel ?? 'Back to Dashboard'}
        </Link>
      )}
    </div>
  )
}
