'use client'

// TransformationTimeline — a configurable vertical stage path.
// Unlike TransformationJourneySection (which has 7 hardcoded stages),
// this accepts an arbitrary stages[] prop so any Lab or journey can use it.

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { TimelineStage } from '@/types/intelligence'

type TransformationTimelineProps = {
  stages: TimelineStage[]
  title?: string
}

function StageNode({
  stage,
  isLast,
  prefersReducedMotion,
}: {
  stage: TimelineStage
  isLast: boolean
  prefersReducedMotion: boolean
}): React.JSX.Element {
  const isActive = stage.status === 'active'
  const isCompleted = stage.status === 'completed'
  const isNext = stage.status === 'next'
  const isLocked = stage.status === 'locked'

  return (
    <li className="relative flex gap-4">
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 w-px bg-border"
          style={{ height: 'calc(100% + 8px)' }}
          aria-hidden="true"
        />
      )}
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
            <div className={cn('size-2 rounded-full bg-primary-foreground', !prefersReducedMotion && 'animate-pulse')} />
          )}
          {isNext && <div className="size-2 rounded-full bg-primary/50" />}
          {isLocked && <div className="size-2 rounded-full bg-muted-foreground/30" />}
        </div>
      </div>
      <div className={cn('min-w-0 pb-5', isLast && 'pb-0')}>
        <div className="flex flex-wrap items-baseline gap-2">
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
          {stage.unlockScore !== undefined && isLocked && (
            <span className="text-[10px] text-muted-foreground/60">
              Mind Score {stage.unlockScore}+
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

export function TransformationTimeline({ stages, title }: TransformationTimelineProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title ?? 'Transformation Journey™'}
      </p>
      <ul className="mt-5 space-y-0" role="list" aria-label={title ?? 'Transformation journey stages'}>
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
