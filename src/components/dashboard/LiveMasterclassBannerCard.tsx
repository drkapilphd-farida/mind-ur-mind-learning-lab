'use client'

import { useState } from 'react'
import { CheckCircle2, GraduationCap, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { joinLiveMasterclassWaitlist } from '@/app/unified-quantum-session-preview/actions/joinLiveMasterclassWaitlist'

type LiveMasterclassBannerCardProps = {
  // Resolved server-side by page.tsx (getLiveMasterclassWaitlistStatus)
  // before this ever renders — mirrors AIDocumentTransformerWidget's own
  // initial-prop pattern, so there's no client-side "Checking…" flash on
  // first paint the way the compact completion-screen card has.
  initialHasJoined: boolean
}

type JoinState = 'idle' | 'joining' | 'joined' | 'error'

// Live Masterclass™ — a premium upsell banner promoting Dr. Kapil Dev
// Sharma's live QSR batches. Reuses the exact same real, honest waitlist
// mechanism already built for the QSR Pro Circuit's completion screen
// (joinLiveMasterclassWaitlist, the live_masterclass_waitlist table) —
// no new backend, and the copy never promises a date/time that doesn't
// exist yet, only that we'll notify them.
export function LiveMasterclassBannerCard({ initialHasJoined }: LiveMasterclassBannerCardProps): React.JSX.Element {
  const [state, setState] = useState<JoinState>(initialHasJoined ? 'joined' : 'idle')

  async function handleJoin(): Promise<void> {
    setState('joining')
    const result = await joinLiveMasterclassWaitlist()
    setState(result.success ? 'joined' : 'error')
  }

  return (
    <div className="glass-premium-card glass-premium-lift relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="brand-gradient flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg">
            <GraduationCap className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Live Masterclass</p>
            <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Join the Quantum Speed Reading Live Masterclass
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Direct mentorship with Dr. Kapil Dev Sharma in a live, interactive batch — real-time coaching, not a recording.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:pl-4">
          {state === 'joined' ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              You&rsquo;re on the waitlist
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              disabled={state === 'joining'}
              onClick={() => void handleJoin()}
              className="brand-gradient w-full rounded-xl text-white shadow-lg hover:opacity-90 sm:w-auto"
            >
              {state === 'joining' ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Joining…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" />
                  Join Waitlist
                </>
              )}
            </Button>
          )}
          {state === 'error' && <p className="text-xs text-destructive">Something went wrong. Please try again.</p>}
          {state !== 'joined' && <p className="text-[11px] text-muted-foreground">We&rsquo;ll notify you the moment a batch is scheduled.</p>}
        </div>
      </div>
    </div>
  )
}
