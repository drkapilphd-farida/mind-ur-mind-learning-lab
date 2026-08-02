'use client'

import Link from 'next/link'
import { ArrowLeft, Circle, Wind, Move, Target, ScanEye, type LucideIcon } from 'lucide-react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FIXATION_EXERCISE_LABEL, FIXATION_EXERCISE_ROUTE } from '../../fixation/fixationLevels'
import type { FixationExerciseType } from '../../fixation/fixationTypes'
import type { FixationStats } from '../../fixation/queries/getFixationStats'

type FixationHubProps = {
  stats: FixationStats
}

type FixationHubCard = {
  exerciseType: FixationExerciseType
  icon: LucideIcon
  description: string
}

const FIXATION_HUB_CARDS: readonly FixationHubCard[] = [
  { exerciseType: 'static-dot', icon: Circle, description: 'Fix your gaze on a single point.' },
  { exerciseType: 'breath-sync', icon: Wind, description: 'Follow a dot that breathes with you.' },
  { exerciseType: 'dynamic-dot', icon: Move, description: 'Track a moving dot with your eyes.' },
  { exerciseType: 'multi-dot', icon: Target, description: 'Tap the highlighted target as it moves.' },
  { exerciseType: 'peripheral', icon: ScanEye, description: 'Stay centered while symbols flash at the edges.' },
]

// Home screen for the Visual Fixation Engine™ — a self-contained hub (not
// wired into the existing Foundation Journey home, per this sprint's
// isolation constraint). Stats are always the live, real numbers from
// fixation_sessions — never a separately cached counter.
export function FixationHub({ stats }: FixationHubProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10">
      <Link
        href="/labs/visual-intelligence"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Visual Intelligence Lab™
      </Link>

      <div className={fadeClass} style={fadeStyle(80)}>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Visual Fixation Engine™</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Five premium exercises that train sustained visual attention — no camera, no eye tracking.
        </p>
      </div>

      <div className={cn('flex items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm', fadeClass)} style={fadeStyle(160)}>
        <ProgressRing
          progress={stats.focusScore / 100}
          size={72}
          label={`${stats.focusScore}`}
          accessibleLabel={`Visual Focus Score ${stats.focusScore} out of 100`}
        />
        <div className="flex-1 space-y-2 text-left">
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Focus Score™</p>
            <p className="text-sm font-semibold text-foreground">{stats.focusScore} / 100</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Streak</p>
            <p className="text-sm font-semibold text-foreground">{stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Completed Sessions</p>
            <p className="text-sm font-semibold text-foreground">{stats.completedSessionCount}</p>
          </div>
        </div>
      </div>

      <div className={cn('flex flex-col gap-3', fadeClass)} style={fadeStyle(240)}>
        {FIXATION_HUB_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.exerciseType}
              href={FIXATION_EXERCISE_ROUTE[card.exerciseType]}
              className="flex items-center gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground">{FIXATION_EXERCISE_LABEL[card.exerciseType]}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{card.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
