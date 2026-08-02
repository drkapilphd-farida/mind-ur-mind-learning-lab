'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { DnaEvolutionTrait } from '../../ai-reading-coach/dnaEvolutionEngine'
import type { ReadingDnaDimension } from '../../adaptive-intelligence/readingIntelligenceTypes'

type ReadingDnaEvolutionCardProps = {
  traits: readonly DnaEvolutionTrait[]
}

const DIMENSION_LABEL: Record<ReadingDnaDimension, string> = {
  'reading-style': 'Reading Style',
  'visual-processing': 'Visual Processing',
  'reading-strategy': 'Reading Strategy',
  'focus-pattern': 'Focus Pattern',
  'difficulty-comfort': 'Difficulty Comfort',
  'category-preference': 'Category Preference',
}

const MAX_BAR_HEIGHT = 28
const MIN_BAR_HEIGHT = 3

function TraitTrend({ trait }: { trait: DnaEvolutionTrait }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const currentConfidence = trait.trend[trait.trend.length - 1]?.confidence ?? 0

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{DIMENSION_LABEL[trait.dimension]}</span>
        <span className="font-medium text-foreground">
          {trait.label} <span className="text-xs text-muted-foreground">· {currentConfidence}% confidence</span>
        </span>
      </div>
      {trait.trend.length > 0 && (
        <div className="mt-2 flex h-8 items-end gap-1" role="img" aria-label={`${DIMENSION_LABEL[trait.dimension]} confidence trend over ${trait.trend.length} checkpoints`}>
          {trait.trend.map((point, index) => {
            const heightPx = Math.max(MIN_BAR_HEIGHT, Math.round((point.confidence / 100) * MAX_BAR_HEIGHT))
            return (
              <div
                key={index}
                className={cn('w-full max-w-4 rounded-full bg-primary/60', !prefersReducedMotion && 'transition-[height] duration-500 ease-out')}
                style={{ height: `${heightPx}px` }}
                title={`Session ${point.sessionCount}: ${point.confidence}% confidence`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// "Show trend instead of fixed values" — every point re-derives Reading
// DNA™ from a real historical window (dnaEvolutionEngine.ts), never a
// fixed snapshot. Bars animate via the same transition-[height] pattern
// used throughout this app's other charts.
export function ReadingDnaEvolutionCard({ traits }: ReadingDnaEvolutionCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reading DNA™ Evolution</p>
      <div className="mt-4 space-y-5">
        {traits.map((trait) => (
          <TraitTrend key={trait.dimension} trait={trait} />
        ))}
      </div>
    </div>
  )
}
