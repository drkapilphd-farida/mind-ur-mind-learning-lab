import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Honest locked state shown when a visitor reaches /tratak directly before
// completing the Foundation Journey — no redirect, no error, consistent
// with this app's anonymous-safe honest-state conventions.
export function TratakJourneyLocked(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-6" aria-hidden="true" />
      </div>
      <p className="mt-6 text-xs font-medium tracking-widest text-muted-foreground uppercase">Tratak Intelligence Journey™</p>
      <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Journey Locked</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Complete the Foundation Journey™ — Preparation, Fixation, and the Persistence Challenge — to unlock the Tratak Intelligence
        Journey™.
      </p>
      <Button asChild size="lg" className="mt-6 gap-2 rounded-full">
        <Link href="/labs/visual-intelligence">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Visual Intelligence Lab™
        </Link>
      </Button>
    </div>
  )
}
