'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { joinLiveMasterclassWaitlist } from '../actions/joinLiveMasterclassWaitlist'
import { getLiveMasterclassWaitlistStatus } from '../actions/getLiveMasterclassWaitlistStatus'

type State = 'loading' | 'not-joined' | 'joining' | 'joined' | 'error'

// Live Masterclass™ — an honest interest waitlist for Dr. Kapil Dev
// Sharma's live QSR batches (documented product philosophy, no scheduled
// class exists today — see the migration's own comment). Copy never
// promises a date/time; the only claim made is "we'll notify you," which
// is exactly what joining actually does. Shown only to Pro-tier learners
// on the Circuit's completion screen (see UnifiedQuantumSession.tsx).
export function LiveMasterclassWaitlistCard(): React.JSX.Element {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let cancelled = false
    void getLiveMasterclassWaitlistStatus().then((hasJoined) => {
      if (!cancelled) setState(hasJoined ? 'joined' : 'not-joined')
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleJoin(): Promise<void> {
    setState('joining')
    const result = await joinLiveMasterclassWaitlist()
    setState(result.success ? 'joined' : 'error')
  }

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-4 text-left">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500">
          <GraduationCap className="size-4.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Live Masterclass with Dr. Kapil Dev Sharma</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time coaching in a live QSR batch. We&rsquo;ll notify you the moment one is scheduled.
          </p>

          <div className="mt-3">
            {state === 'loading' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Checking…
              </div>
            )}

            {state === 'not-joined' && (
              <Button type="button" size="sm" variant="outline" className="border-violet-500/30 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400" onClick={() => void handleJoin()}>
                Notify Me
              </Button>
            )}

            {state === 'joining' && (
              <Button type="button" size="sm" variant="outline" disabled className="border-violet-500/30">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Joining…
              </Button>
            )}

            {state === 'joined' && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                You&rsquo;re on the list
              </p>
            )}

            {state === 'error' && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-destructive">Something went wrong.</p>
                <button type="button" onClick={() => void handleJoin()} className="text-xs font-medium text-violet-600 underline underline-offset-2 dark:text-violet-400">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
