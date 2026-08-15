'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { CURRICULUM_PHASES, type CurriculumPhase } from '@/features/thirty-day-curriculum/curriculumDatabase'
import { loadCurriculumProgress } from '@/features/thirty-day-curriculum/curriculumProgress'

const CURRICULUM_ROUTE = '/labs/quantum-speed-reading/thirty-day-curriculum'

const RING_SIZE = 88
const RING_STROKE = 9

// One accent per phase — the Apple Fitness convention of a distinct ring
// color per goal, not a single repeated primary color across all four.
const PHASE_ACCENTS: Record<CurriculumPhase['id'], string> = {
  1: '#2b4ce8', // brand blue — Foundation
  2: '#8b5cf6', // violet — Right-Brain Expansion
  3: '#0fd9a0', // brand teal — Holographic Manifestation
  4: '#f59e0b', // amber — Peak Mastery
}

function PhaseRing({ percent, accent }: { percent: number; accent: string }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animated = useCountUp(percent, 800, prefersReducedMotion)
  const r = (RING_SIZE - RING_STROKE) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - percent / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }} aria-hidden="true">
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" strokeWidth={RING_STROKE} className="stroke-foreground/[0.07]" />
        {percent > 0 && (
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={r}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            stroke={accent}
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-base font-bold tabular-nums text-foreground">{Math.round(animated)}%</span>
      </div>
    </div>
  )
}

// Apple Fitness/Health-inspired 4-phase milestone tracker for the real
// 30-Day Curriculum (curriculumDatabase.ts's own CURRICULUM_PHASES —
// single source of truth for the day ranges/titles, never hardcoded
// here). Progress is real per-day completion from loadCurriculumProgress()
// (localStorage — same client-only data source and mount-time read
// pattern already established by ThirtyDayMasterclassHeroCard.tsx).
export function CurriculumMilestoneTimeline(): React.JSX.Element {
  const [completedDays, setCompletedDays] = useState<readonly number[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCompletedDays(loadCurriculumProgress().completedDays)
    setHydrated(true)
  }, [])

  return (
    <div className="glass-premium-card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">30-Day Milestone Timeline™</p>
        <Link href={CURRICULUM_ROUTE} className="text-xs font-medium text-primary hover:underline">
          View roadmap →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CURRICULUM_PHASES.map((phase) => {
          const [start, end] = phase.dayRange
          const totalDays = end - start + 1
          const completedInPhase = hydrated ? completedDays.filter((day) => day >= start && day <= end).length : 0
          const percent = Math.round((completedInPhase / totalDays) * 100)

          return (
            <Link
              key={phase.id}
              href={CURRICULUM_ROUTE}
              className="glass-premium-lift flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 text-center transition-opacity hover:opacity-90"
            >
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Days {start}–{end}
              </p>
              <PhaseRing percent={percent} accent={PHASE_ACCENTS[phase.id]} />
              <div>
                <p className="text-xs font-semibold text-foreground">{phase.title}</p>
                <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {completedInPhase} / {totalDays} days
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
