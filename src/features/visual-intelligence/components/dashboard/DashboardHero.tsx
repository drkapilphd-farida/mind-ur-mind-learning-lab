'use client'

import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { DnaLevelName } from '../../dna/dnaTypes'

function getTimeOfDayGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type DashboardHeroProps = {
  studentName: string
  currentStreak: number
  dnaLevelName: DnaLevelName
  neuralEvolutionOverallScore: number
}

export function DashboardHero({ studentName, currentStreak, dnaLevelName, neuralEvolutionOverallScore }: DashboardHeroProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedNeuralScore = useCountUp(neuralEvolutionOverallScore, 900, prefersReducedMotion)
  const greeting = getTimeOfDayGreeting(new Date().getHours())
  const first = studentName.split(' ')[0]

  return (
    <div
      className={cn(
        'rounded-3xl border bg-gradient-to-br from-primary/[0.08] via-card to-card p-8 shadow-sm backdrop-blur-sm',
        !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
      )}
    >
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Welcome back,</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
        {greeting}, {first}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Continue evolving your Visual Intelligence.</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Today&apos;s Streak</dt>
          <dd className="mt-1 font-heading text-xl font-bold text-foreground">{currentStreak} day{currentStreak === 1 ? '' : 's'}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Current Level</dt>
          <dd className="mt-1 font-heading text-xl font-bold text-foreground">{dnaLevelName}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual DNA™</dt>
          <dd className="mt-1 font-heading text-xl font-bold text-foreground">Active</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Neural Evolution</dt>
          <dd className="mt-1 font-heading text-xl font-bold text-foreground tabular-nums">{Math.round(animatedNeuralScore)}%</dd>
        </div>
      </dl>
    </div>
  )
}
