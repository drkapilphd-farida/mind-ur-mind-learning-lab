import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EXERCISE_BODY_CLASSNAME, EXERCISE_SCREEN_CLASSNAME, EXERCISE_TITLE_CLASSNAME } from './exerciseStyles'

type ExerciseLockedScreenProps = {
  title: string
  unlockHref: string
  unlockLabel: string
}

// Shown when a student lands on an exercise URL directly (bookmark, typed
// link, browser back/forward) before earning access to it in sequence.
export function ExerciseLockedScreen({ title, unlockHref, unlockLabel }: ExerciseLockedScreenProps): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div className="mx-auto max-w-sm">
        <h1 className={EXERCISE_TITLE_CLASSNAME}>{title} is locked</h1>
        <p className={cn('mt-4', EXERCISE_BODY_CLASSNAME)}>
          These exercises build on each other in order. Finish the ones before this one first.
        </p>
        <Button asChild size="lg" className="mt-10 min-w-[200px] rounded-full shadow-sm">
          <Link href={unlockHref}>{unlockLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
