'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, GraduationCap, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { joinLiveMasterclassWaitlist } from '@/app/unified-quantum-session-preview/actions/joinLiveMasterclassWaitlist'
import { getCurriculumDayTheme } from '@/features/thirty-day-curriculum/curriculumDatabase'
import { computeConsistencyPercent, getHighestUnlockedDay, loadCurriculumProgress } from '@/features/thirty-day-curriculum/curriculumProgress'

const CURRICULUM_ROUTE = '/labs/quantum-speed-reading/thirty-day-curriculum'

type ThirtyDayMasterclassHeroCardProps = {
  // Resolved server-side by page.tsx (getLiveMasterclassWaitlistStatus) —
  // same initial-prop pattern the standalone LiveMasterclassBannerCard
  // used before its waitlist UI was folded into this flagship hero.
  initialHasJoinedWaitlist: boolean
}

type JoinState = 'idle' | 'joining' | 'joined' | 'error'

// Tier 3 · Flagship Mastery Program — the 3-Tier Value Ladder's premium
// hero card, deliberately merging two previously-separate cards
// (ThirtyDayCurriculumDashboardCard + LiveMasterclassBannerCard) into one:
// the real, free, self-paced 30-Day Curriculum (client-only progress, no
// payment gate — see curriculumProgress.ts) presented alongside the real
// Live Cohort mentorship waitlist (live_masterclass_waitlist, unchanged
// mechanism). The ₹4,999 badge is honest marketing copy for the live
// cohort, NOT a live checkout — no price is ever charged here; "Reserve
// Your Seat" only records a real interest signal, exactly like the
// waitlist banner it replaces, and says so explicitly in its own helper
// copy so nobody mistakes it for a completed purchase.
export function ThirtyDayMasterclassHeroCard({ initialHasJoinedWaitlist }: ThirtyDayMasterclassHeroCardProps): React.JSX.Element {
  const [nextDay, setNextDay] = useState<number | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [consistencyPercent, setConsistencyPercent] = useState(0)
  const [joinState, setJoinState] = useState<JoinState>(initialHasJoinedWaitlist ? 'joined' : 'idle')

  useEffect(() => {
    const progress = loadCurriculumProgress()
    setHasStarted(progress.completedDays.length > 0)
    setNextDay(getHighestUnlockedDay(progress))
    setConsistencyPercent(computeConsistencyPercent(progress))
  }, [])

  async function handleJoinWaitlist(): Promise<void> {
    setJoinState('joining')
    const result = await joinLiveMasterclassWaitlist()
    setJoinState(result.success ? 'joined' : 'error')
  }

  const theme = nextDay !== null ? getCurriculumDayTheme(nextDay) : null

  return (
    <div
      className="glass-premium-card glass-premium-lift glass-premium-card--emphasized relative overflow-hidden p-6 sm:p-8"
      data-hero-card="thirty-day-masterclass"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-14 size-64 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="brand-gradient flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg">
              <GraduationCap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">Tier 3 · Flagship Mastery Program</p>
              <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                30-Day Quantum Speed Reading Mastery + Live Cohort
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                A structured 30-day roadmap paired with live mentorship from Dr. Kapil Dev Sharma — real-time coaching, not a recording.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold tabular-nums text-primary">₹4,999 · Live Cohort</span>
        </div>

        <ul className="grid grid-cols-1 gap-2 text-sm text-foreground sm:grid-cols-3">
          <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            30-day structured curriculum
          </li>
          <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            7 live mentorship sessions
          </li>
          <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Real WPM + comprehension checkpoints
          </li>
        </ul>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Your Curriculum Progress</p>
            <p className="mt-0.5 text-sm font-medium text-foreground" data-curriculum-status={hasStarted ? 'in-progress' : 'not-started'}>
              {nextDay === null ? 'Loading…' : hasStarted && theme !== null ? `Day ${nextDay} — ${theme.title}` : 'Not started yet — free to begin'}
            </p>
            {hasStarted && <p className="text-xs text-muted-foreground">{consistencyPercent}% of the 30 days complete</p>}
          </div>
          <Button asChild size="lg" variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href={CURRICULUM_ROUTE}>{nextDay === null ? 'Open Curriculum' : hasStarted ? `Continue Day ${nextDay}` : 'Start Day 1 — Free'}</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Live Cohort Mentorship</p>
            <p className="text-[11px] text-muted-foreground">
              Free to reserve your seat — we&rsquo;ll notify you the moment a batch is scheduled. No payment is taken today.
            </p>
          </div>
          {joinState === 'joined' ? (
            <div className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 sm:w-auto">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              You&rsquo;re on the waitlist
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              disabled={joinState === 'joining'}
              onClick={() => void handleJoinWaitlist()}
              className="brand-gradient w-full shrink-0 rounded-full text-white shadow-lg hover:opacity-90 sm:w-auto"
              data-join-waitlist-button="true"
            >
              {joinState === 'joining' ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Reserving…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" />
                  Reserve Your Seat
                </>
              )}
            </Button>
          )}
        </div>
        {joinState === 'error' && <p className="text-xs text-destructive">Something went wrong. Please try again.</p>}

        <Link href="/pricing" className="text-xs font-medium text-primary hover:underline">
          View all plans &amp; pricing →
        </Link>
      </div>
    </div>
  )
}
