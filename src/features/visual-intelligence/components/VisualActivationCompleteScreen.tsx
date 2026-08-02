import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  EXERCISE_BODY_CLASSNAME,
  EXERCISE_SCREEN_CLASSNAME,
  EXERCISE_TITLE_CLASSNAME,
} from '@/components/exercises/exerciseStyles'

export function VisualActivationCompleteScreen(): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div className="mx-auto max-w-sm">
        <h1 className={EXERCISE_TITLE_CLASSNAME}>Visual Foundation Activated™</h1>
        <p className={`mt-4 ${EXERCISE_BODY_CLASSNAME}`}>
          You trained eye flexibility, sustained focus, visual persistence, and calm recognition — the visual foundation fast reading builds on.
        </p>

        <Button asChild size="lg" className="mt-10 min-w-[280px] rounded-full shadow-sm">
          <Link href="/labs/quantum-speed-reading/preparation">Continue to Reading Preparation™</Link>
        </Button>
      </div>
    </div>
  )
}
