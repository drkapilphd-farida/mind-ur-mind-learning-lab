import Link from 'next/link'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EXERCISE_BODY_CLASSNAME, EXERCISE_SCREEN_CLASSNAME, EXERCISE_TITLE_CLASSNAME } from './exerciseStyles'

type ProLockedScreenProps = {
  title: string
}

// Quantum Speed Reading Paywall™ — the Pro-only counterpart to
// ExerciseLockedScreen (which locks a step for sequential-mastery
// reasons). Deliberately a separate component rather than a new prop on
// ExerciseLockedScreen: the copy and destination are fundamentally
// different (upgrade, not "finish the previous exercise"), and keeping
// them separate means a mastery lock can never accidentally read as a
// paywall or vice versa.
export function ProLockedScreen({ title }: ProLockedScreenProps): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div className="mx-auto max-w-sm">
        <div aria-hidden="true" className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="size-6 text-primary" />
        </div>
        <h1 className={EXERCISE_TITLE_CLASSNAME}>{title} is a Pro feature</h1>
        <p className={cn('mt-4', EXERCISE_BODY_CLASSNAME)}>
          Visual Activation™ is free for everyone. Upgrade to Quantum Mind Pro to unlock {title} and the rest of your Brain Transformation Experience™.
        </p>
        <Button asChild size="lg" className="mt-10 min-w-[200px] rounded-full shadow-sm">
          <Link href="/pricing#family-pro">Upgrade to Pro</Link>
        </Button>
      </div>
    </div>
  )
}
