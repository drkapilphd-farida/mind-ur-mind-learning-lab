'use client'

import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { TRATAK_MISSION_BY_ID } from '../tratakMissions'
import type { TratakMissionId } from '../tratakTypes'
import type { TratakMissionStatus } from '../tratakMissionEngine'
import { TratakMissionCard } from './TratakMissionCard'

// Only plain, serializable data crosses the Server->Client boundary here —
// title/description/icon/difficulty/etc. are static content already
// available client-side via TRATAK_MISSION_BY_ID, resolved locally below.
// Lucide icon components (functions) cannot be passed as props from a
// Server Component into a 'use client' component.
export type TratakLandingMissionViewModel = {
  id: TratakMissionId
  status: TratakMissionStatus
}

// Sprint 10B+: real routes as each mission's engine ships. Missions absent
// here still render the original disabled "Coming Soon" button.
//
// Sprint 10F refinement: 'mandala-persistence' is kept here (route still
// works if visited directly) even though it's no longer in TRATAK_MISSIONS
// (tratakMissions.ts) — so this entry is simply never looked up by the
// roadmap anymore, harmless dead weight kept for the same "leave it in
// place" reasoning as the rest of that mission's files.
const MISSION_ROUTE: Partial<Record<TratakMissionId, string>> = {
  'mandala-persistence': '/labs/visual-intelligence/tratak/mandala',
  'candle-tratak': '/labs/visual-intelligence/tratak/candle',
  'image-persistence-challenge': '/labs/visual-intelligence/tratak/image-persistence',
}

type TratakJourneyLandingProps = {
  progressPercent: number
  level: number
  xp: number
  currentStreak: number
  persistenceScore: number
  missions: readonly TratakLandingMissionViewModel[]
}

export function TratakJourneyLanding({
  progressPercent,
  level,
  xp,
  currentStreak,
  persistenceScore,
  missions,
}: TratakJourneyLandingProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/labs/visual-intelligence"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Visual Intelligence Lab™
      </Link>

      {/* Premium glass hero */}
      <div
        className={cn(
          'relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-8 text-center shadow-xl backdrop-blur-xl',
          fadeClass,
        )}
        style={fadeStyle(0)}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent" aria-hidden="true" />

        {/* Hero illustration placeholder — decorative only, no fabricated artwork */}
        <div className="relative mx-auto flex size-28 items-center justify-center rounded-full bg-primary/[0.08]" aria-hidden="true">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.15] text-primary">
            <Eye className="size-8" aria-hidden="true" />
          </div>
        </div>

        <p className="relative mt-6 text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Lab™</p>
        <h1 className="relative mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Tratak Intelligence Journey™
        </h1>
        <p className="relative mx-auto mt-3 max-w-md text-base leading-relaxed text-foreground/80">
          Develop stable visual attention, strengthen eye fixation and improve visual persistence through progressive guided practice.
        </p>
      </div>

      {/* Journey progress rings */}
      <div className={cn('mt-8 rounded-3xl border bg-card p-6 shadow-sm', fadeClass)} style={fadeStyle(100)}>
        <div className="flex items-center justify-center">
          <ProgressRing
            progress={progressPercent / 100}
            size={112}
            label={`${progressPercent}%`}
            accessibleLabel={`Journey progress ${progressPercent}% complete`}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Level', value: level },
            { label: 'XP', value: xp },
            { label: 'Streak', value: `${currentStreak}d` },
            { label: 'Persistence', value: persistenceScore },
            { label: 'Completion', value: `${progressPercent}%` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-muted/30 p-3 text-center">
              <p className="text-lg font-semibold text-foreground tabular-nums">{stat.value}</p>
              <p className="mt-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission roadmap */}
      <div className={cn('mt-10', fadeClass)} style={fadeStyle(150)}>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Mission Roadmap</p>
        <div className="mt-4 space-y-4">
          {missions.map((mission) => {
            const definition = TRATAK_MISSION_BY_ID[mission.id]
            return (
              <TratakMissionCard
                key={mission.id}
                order={definition.order}
                title={definition.title}
                description={definition.description}
                icon={definition.icon}
                difficulty={definition.difficulty}
                estimatedTimeSeconds={definition.estimatedTimeSeconds}
                xpReward={definition.xpReward}
                status={mission.status}
                href={MISSION_ROUTE[mission.id]}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
