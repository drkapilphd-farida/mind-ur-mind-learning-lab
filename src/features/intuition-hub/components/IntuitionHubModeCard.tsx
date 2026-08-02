'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { loadBestEspStats } from '@/features/esp-zener-telepathy/espZenerLocalHistory'
import { loadBestQuantumGridStats } from '@/features/quantum-hidden-target-grid/quantumHiddenTargetGridLocalHistory'
import type { IntuitionHubMode } from '../intuitionHubModes'

type IntuitionHubModeCardProps = {
  mode: IntuitionHubMode
  lastPractisedLabel: string | null
}

// Each intuition exercise owns its own local-history file, self-contained
// (espZenerLocalHistory.ts, quantumHiddenTargetGridLocalHistory.ts — never
// shared between exercises, matching every other exercise pair in this
// project). The hub card is the one place that legitimately needs to read
// across all of them, so it holds a small exerciseId -> loader lookup
// (same shape-discriminator pattern ReadingHubModeCard.tsx already uses
// for its own statUnit-based loadBestTimeMs/loadBestWpm branch) rather than
// hardcoding a single exercise's loader.
const BEST_STATS_LOADERS: Record<string, (storageKey: string) => { bestAccuracyPercent: number; bestStreak: number }> = {
  'esp-zener-telepathy-sprint': loadBestEspStats,
  'quantum-hidden-target-grid': loadBestQuantumGridStats,
}

// Visually mirrors ReadingHubModeCard.tsx's own Card/CardContent + hover-
// lift + ArrowRight convention, but reads a genuinely different "best"
// stat: intuition accuracy percent, not WPM or completion time. Best stat
// is read from localStorage client-side after mount — it's genuinely
// unavailable during SSR, so it shows "—" until then rather than a
// fabricated placeholder value.
export function IntuitionHubModeCard({ mode, lastPractisedLabel }: IntuitionHubModeCardProps): React.JSX.Element {
  const [bestAccuracyPercent, setBestAccuracyPercent] = useState<number | null>(null)

  useEffect(() => {
    if (mode.storageKey === undefined || mode.exerciseId === undefined) return
    const loadBestStats = BEST_STATS_LOADERS[mode.exerciseId]
    if (loadBestStats === undefined) return
    setBestAccuracyPercent(loadBestStats(mode.storageKey).bestAccuracyPercent)
  }, [mode.storageKey, mode.exerciseId])

  const bestLabel = bestAccuracyPercent === null ? '—' : bestAccuracyPercent === 0 ? 'No sessions yet' : `${bestAccuracyPercent}% accuracy`

  const cardBody = (
    <Card
      className={
        mode.status === 'available'
          ? 'h-full transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring ring-1 ring-foreground/10'
          : 'h-full opacity-60 ring-1 ring-foreground/10'
      }
    >
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{mode.title}</h3>
          {mode.status === 'coming-soon' && (
            <Badge variant="secondary" className="w-fit shrink-0">
              Coming Soon
            </Badge>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{mode.purpose}</p>

        {mode.status === 'available' && (
          <dl className="mt-auto grid grid-cols-1 gap-x-3 gap-y-1.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Best Accuracy</dt>
              <dd className="font-medium text-foreground">{bestLabel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Last Practised</dt>
              <dd className="font-medium text-foreground">{lastPractisedLabel ?? 'Not yet practised'}</dd>
            </div>
          </dl>
        )}

        {mode.status === 'available' && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-foreground">Start →</span>
            <ArrowRight
              className="size-4 text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (mode.status === 'coming-soon' || mode.href === undefined) {
    return cardBody
  }

  return (
    <Link href={mode.href} className="group block focus-visible:outline-none">
      {cardBody}
    </Link>
  )
}
