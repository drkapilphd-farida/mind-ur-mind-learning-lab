'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { loadBestPhotographicMemoryStats } from '@/features/photographic-memory/photographicMemoryLocalHistory'
import { loadBestEssenceSprintStats } from '@/features/pictorial-essence-sprint/pictorialEssenceSprintLocalHistory'
import { loadBestHemisphericColorSyncStats } from '@/features/hemispheric-color-sync/hemisphericColorSyncLocalHistory'
import { loadBestAfterImageGazingStats } from '@/features/after-image-gazing/afterImageGazingLocalHistory'
import { loadBestDotMemoryGridStats } from '@/features/dot-memory-grid/dotMemoryGridLocalHistory'
import { loadBestNumberFlashGridStats } from '@/features/number-flash-grid/numberFlashGridLocalHistory'
import type { RightBrainHubMode } from '../rightBrainHubModes'

type RightBrainHubModeCardProps = {
  mode: RightBrainHubMode
  lastPractisedLabel: string | null
}

// Each right-brain exercise owns its own local-history file, self-
// contained (photographicMemoryLocalHistory.ts, pictorialEssenceSprintLocalHistory.ts
// — never shared between exercises, and each free to name its own "best"
// field independently — Photographic Memory calls it bestScorePercent,
// Pictorial Essence Sprint calls it bestAccuracyPercent). The hub card is
// the one place that legitimately needs to read across all of them, so
// it holds a small exerciseId -> loader lookup (same pattern
// IntuitionHubModeCard.tsx uses, added there only after a second
// exercise exposed the bug of hardcoding a single exercise's loader —
// built in here from the very first entry instead), with each loader
// normalizing its own exercise's field name to the one shape this card
// renders.
const BEST_STATS_LOADERS: Record<string, (storageKey: string) => { bestScorePercent: number; bestStreak: number }> = {
  'photographic-memory': loadBestPhotographicMemoryStats,
  'pictorial-essence-sprint': (storageKey) => {
    const stats = loadBestEssenceSprintStats(storageKey)
    return { bestScorePercent: stats.bestAccuracyPercent, bestStreak: stats.bestStreak }
  },
  'hemispheric-color-sync': (storageKey) => {
    const stats = loadBestHemisphericColorSyncStats(storageKey)
    return { bestScorePercent: stats.bestAccuracyPercent, bestStreak: stats.bestStreak }
  },
  'after-image-gazing': (storageKey) => {
    const stats = loadBestAfterImageGazingStats(storageKey)
    return { bestScorePercent: stats.bestClarityPercent, bestStreak: stats.bestStreak }
  },
  'dot-memory-grid': loadBestDotMemoryGridStats,
  'number-flash-grid': loadBestNumberFlashGridStats,
}

// Visually mirrors ReadingHubModeCard.tsx/IntuitionHubModeCard.tsx's own
// Card/CardContent + hover-lift + ArrowRight convention, but reads a
// genuinely different "best" stat: right-brain photographic score
// percent, not WPM or completion time. Best stat is read from
// localStorage client-side after mount — it's genuinely unavailable
// during SSR, so it shows "—" until then rather than a fabricated
// placeholder value.
export function RightBrainHubModeCard({ mode, lastPractisedLabel }: RightBrainHubModeCardProps): React.JSX.Element {
  const [bestScorePercent, setBestScorePercent] = useState<number | null>(null)

  useEffect(() => {
    if (mode.storageKey === undefined || mode.exerciseId === undefined) return
    const loadBestStats = BEST_STATS_LOADERS[mode.exerciseId]
    if (loadBestStats === undefined) return
    setBestScorePercent(loadBestStats(mode.storageKey).bestScorePercent)
  }, [mode.storageKey, mode.exerciseId])

  const bestLabel = bestScorePercent === null ? '—' : bestScorePercent === 0 ? 'No sessions yet' : `${bestScorePercent}% score`

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
              <dt className="text-muted-foreground">Best Score</dt>
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
