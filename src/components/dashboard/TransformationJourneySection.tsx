'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type StageStatus = 'completed' | 'active' | 'next' | 'locked'

type Stage = {
  id: string
  label: string
  description: string
  status: StageStatus
  minScore?: number
}

type TransformationJourneySectionProps = {
  completedCount: number
  mindScore: number
}

// Stage thresholds — when a Lab ships, update its status from 'locked'
// to 'next'/'active' here; no component changes needed anywhere else.
// mindScore (0–1000) unlocks later stages — the thresholds are deliberately
// high so students earn them through sustained practice, not just completing
// exercises once. When a Lab ships, its 'locked' stage converts to 'next'
// or 'active' automatically based on the student's score.
function buildStages(completedCount: number, mindScore: number): Stage[] {
  const inReading = completedCount >= 1
  const readingComplete = completedCount >= 6

  return [
    {
      id: 'activation',
      label: 'Mind Activation',
      description: 'Begin your transformation',
      status: inReading ? 'completed' : 'active',
    },
    {
      id: 'reading',
      label: 'Reading Intelligence',
      description: 'Speed, span, comprehension',
      status: inReading && !readingComplete ? 'active' : inReading && readingComplete ? 'completed' : 'next',
    },
    {
      id: 'memory',
      label: 'Memory Intelligence',
      description: 'Perfect recall and retention',
      status: readingComplete ? 'next' : 'locked',
      minScore: 500,
    },
    {
      id: 'focus',
      label: 'Focus Intelligence',
      description: 'Deep concentration and flow',
      status: mindScore >= 500 ? 'next' : 'locked',
      minScore: 600,
    },
    {
      id: 'mind-fitness',
      label: 'Mind Fitness',
      description: 'Cognitive stamina and agility',
      status: mindScore >= 600 ? 'next' : 'locked',
      minScore: 700,
    },
    {
      id: 'peak-learning',
      label: 'Peak Learning',
      description: 'Elite performance state',
      status: mindScore >= 700 ? 'next' : 'locked',
      minScore: 850,
    },
    {
      id: 'mastery',
      label: 'Mastery',
      description: 'Complete cognitive transformation',
      status: mindScore >= 850 ? 'next' : 'locked',
      minScore: 950,
    },
  ]
}

function StageNode({ stage, isLast, prefersReducedMotion }: { stage: Stage; isLast: boolean; prefersReducedMotion: boolean }): React.JSX.Element {
  const isActive = stage.status === 'active'
  const isCompleted = stage.status === 'completed'
  const isNext = stage.status === 'next'
  const isLocked = stage.status === 'locked'

  return (
    <li className="relative flex gap-4">
      {/* Vertical connector */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 w-px bg-border"
          style={{ height: 'calc(100% + 8px)' }}
          aria-hidden="true"
        />
      )}

      {/* Node circle */}
      <div className="relative z-10 mt-0.5 shrink-0">
        <div
          className={cn(
            'flex size-6 items-center justify-center rounded-full ring-2',
            isCompleted && 'bg-primary ring-primary',
            isActive && 'bg-primary ring-primary',
            isNext && 'bg-background ring-primary/50',
            isLocked && 'bg-muted ring-border',
          )}
          aria-hidden="true"
        >
          {isCompleted && (
            <svg className="size-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isActive && (
            <div
              className={cn(
                'size-2 rounded-full bg-primary-foreground',
                !prefersReducedMotion && 'animate-pulse',
              )}
            />
          )}
          {isNext && <div className="size-2 rounded-full bg-primary/50" />}
          {isLocked && <div className="size-2 rounded-full bg-muted-foreground/30" />}
        </div>
      </div>

      {/* Content */}
      <div className={cn('min-w-0 pb-5', isLast && 'pb-0')}>
        <div className="flex items-baseline gap-2">
          <p className={cn(
            'text-sm font-semibold',
            isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground',
            isLocked && 'opacity-50',
          )}>
            {stage.label}
          </p>
          {isActive && (
            <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium text-foreground">
              Current
            </span>
          )}
          {isNext && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Up next
            </span>
          )}
          {stage.minScore !== undefined && isLocked && (
            <span className="text-[10px] text-muted-foreground/60">
              Mind Score {stage.minScore}+
            </span>
          )}
        </div>
        <p className={cn(
          'mt-0.5 text-xs leading-relaxed',
          isCompleted || isActive ? 'text-muted-foreground' : 'text-muted-foreground/50',
          isLocked && 'opacity-50',
        )}>
          {stage.description}
        </p>
      </div>
    </li>
  )
}

// A stage-based view of the student's transformation arc across all Labs —
// not just today's exercises, but where they are in the full journey from
// first activation to cognitive mastery. Locked stages convert to live
// stages when those Labs ship, without any component changes.
export function TransformationJourneySection({
  completedCount,
  mindScore,
}: TransformationJourneySectionProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const stages = buildStages(completedCount, mindScore)


  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Transformation Journey™
      </p>

      <ul className="mt-5 space-y-0" role="list" aria-label="Transformation journey stages">
        {stages.map((stage, i) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isLast={i === stages.length - 1}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </ul>
    </div>
  )
}
