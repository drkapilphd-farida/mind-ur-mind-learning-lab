import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  EXERCISE_BODY_CLASSNAME,
  EXERCISE_CAPTION_CLASSNAME,
  EXERCISE_SCREEN_CLASSNAME,
  EXERCISE_TITLE_CLASSNAME,
} from '@/components/exercises/exerciseStyles'

const ACTIVATION_LINES = [
  'Eye flexibility improved',
  'Peripheral awareness activated',
  'Forward reading momentum prepared',
  'Recognition speed activated',
] as const

export function ReadingPreparationCompleteScreen(): React.JSX.Element {
  return (
    <div className={EXERCISE_SCREEN_CLASSNAME}>
      <div className="mx-auto max-w-sm">
        <h1 className={EXERCISE_TITLE_CLASSNAME}>Visual System Fully Prepared™</h1>
        <p className={cn('mt-4', EXERCISE_BODY_CLASSNAME)}>Your visual system has been activated.</p>

        <ul className="mt-8 space-y-3 text-left">
          {ACTIVATION_LINES.map((line) => (
            <li key={line} className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className={EXERCISE_CAPTION_CLASSNAME}>{line}</span>
            </li>
          ))}
        </ul>

        <Button asChild size="lg" className="mt-10 min-w-[280px] rounded-full shadow-sm">
          <Link href="/labs/quantum-speed-reading/word-flash">Continue to Flash Intelligence Pack™</Link>
        </Button>
      </div>
    </div>
  )
}
