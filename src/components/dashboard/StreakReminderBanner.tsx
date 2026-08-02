import { Suspense } from 'react'
import Link from 'next/link'
import { Flame, Sparkles, Trophy, ArrowRight } from 'lucide-react'
import { generateStreakNudge } from '@/features/quantum-journey/actions/generateStreakNudge'
import type { StreakBannerStatus } from '@/features/quantum-journey/streakMotivation'

type StreakReminderBannerProps = {
  studentFirstName: string
  status: StreakBannerStatus
  currentStreak: number
  nextDay: number
  milestoneReachedToday: number | null
}

const ANALYTICS_HREF = '/labs/quantum-speed-reading/journey/analytics'

function journeyDayHref(day: number): string {
  return `/labs/quantum-speed-reading/journey/${day}`
}

// Daily Streak Reminders & Motivation System™ — a high-visibility banner
// at the very top of the main dashboard. Deterministic parts (streak
// count, day number, CTA) render instantly from real, already-fetched
// data; only the small AI-generated greeting line streams in separately
// via its own nested Suspense boundary (StreakNudgeMessage below) — the
// same "instant numbers, AI line arrives a moment later" split
// AIMentorSection.tsx already established for the Hero block above this.
export function StreakReminderBanner({ studentFirstName, status, currentStreak, nextDay, milestoneReachedToday }: StreakReminderBannerProps): React.JSX.Element {
  const heading =
    status === 'not-started'
      ? 'Ready to begin your 21-Day Journey?'
      : status === 'completed-today'
        ? `Day ${nextDay - 1} Complete!`
        : status === 'journey-complete'
          ? 'Journey Complete!'
          : status === 'streak-broken'
            ? `Day ${nextDay} is ready whenever you are`
            : `Day ${nextDay} is waiting for you`

  const ctaLabel =
    status === 'not-started'
      ? 'Start Day 1'
      : status === 'journey-complete'
        ? 'View Your Analytics'
        : status === 'streak-broken'
          ? `Start Day ${nextDay}`
          : `Continue Day ${nextDay}`

  const ctaHref = status === 'journey-complete' ? ANALYTICS_HREF : journeyDayHref(nextDay)

  return (
    <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
            {status === 'journey-complete' ? (
              <Trophy className="size-7 text-orange-500" aria-hidden="true" />
            ) : (
              <Flame className={currentStreak > 0 ? 'size-7 text-orange-500' : 'size-7 text-muted-foreground/50'} aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {currentStreak > 0 ? `${currentStreak}-Day Streak` : '21-Day Transformation Journey™'}
              {milestoneReachedToday !== null && ` · 🎉 ${milestoneReachedToday}-Day Milestone!`}
            </p>
            <h2 className="mt-0.5 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">{heading}</h2>
          </div>
        </div>

        {status !== 'completed-today' && (
          <Link
            href={ctaHref}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 border-t border-orange-500/10 pt-4">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-orange-500/70" aria-hidden="true" />
        <Suspense fallback={<StreakNudgeSkeleton />}>
          <StreakNudgeMessage
            studentName={studentFirstName}
            status={status}
            currentStreak={currentStreak}
            nextDay={nextDay}
            milestoneReachedToday={milestoneReachedToday}
          />
        </Suspense>
      </div>
    </div>
  )
}

type StreakNudgeMessageProps = {
  studentName: string
  status: StreakBannerStatus
  currentStreak: number
  nextDay: number
  milestoneReachedToday: number | null
}

// A separate async Server Component so the banner's deterministic chrome
// above renders instantly while this one small line streams in behind
// its own <Suspense> boundary — mirrors AIMentorSection.tsx exactly.
async function StreakNudgeMessage(props: StreakNudgeMessageProps): Promise<React.JSX.Element> {
  const message = await generateStreakNudge(props)
  return <p className="text-sm leading-relaxed text-foreground">{message}</p>
}

function StreakNudgeSkeleton(): React.JSX.Element {
  return <div className="h-4 w-2/3 animate-pulse rounded bg-orange-500/10" />
}
