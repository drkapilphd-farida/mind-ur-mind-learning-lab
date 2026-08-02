'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { loadBestWpm } from '@/features/reading-engine/readingLocalHistory'
import { loadBestTimeMs } from '@/features/schulte-grid-drill/schulteGridLocalHistory'
import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'
import type { ReadingHubMode } from '../readingHubModes'

type ReadingHubModeCardProps = {
  mode: ReadingHubMode
  lastPractisedLabel: string | null
}

// Sprint 3.3A — visually matches the existing Card/CardContent + hover-lift +
// ArrowRight convention already established by ReadingModeCard.tsx, but is a
// new, separate component: that one is tied to the old passage-reading
// pacing-profile picker (?mode= selection state) which doesn't apply here.
// Best stat is read from localStorage client-side after mount — it's
// genuinely unavailable during SSR, so it shows "—" until then rather than
// a fabricated placeholder value.
// Schulte Grid Speed Drill Sprint — mode.statUnit branches which
// localStorage reader/formatter applies (lower-is-better time vs.
// higher-is-better WPM), since a single hardcoded "Best Reading Pace in
// wpm" no longer describes every mode in this Hub.
export function ReadingHubModeCard({ mode, lastPractisedLabel }: ReadingHubModeCardProps): React.JSX.Element {
  const statUnit = mode.statUnit ?? 'wpm'
  const [bestValue, setBestValue] = useState<number | null>(null)

  useEffect(() => {
    if (mode.storageKey === undefined) return
    setBestValue(statUnit === 'time-ms' ? loadBestTimeMs(mode.storageKey) : loadBestWpm(mode.storageKey))
  }, [mode.storageKey, statUnit])

  const statLabel = statUnit === 'time-ms' ? 'Best Time' : 'Best Reading Pace'
  const bestPaceLabel =
    bestValue === null
      ? '—'
      : bestValue === 0
        ? 'No sessions yet'
        : statUnit === 'time-ms'
          ? formatElapsedTime(bestValue)
          : `${bestValue} wpm`

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
              <dt className="text-muted-foreground">{statLabel}</dt>
              <dd className="font-medium text-foreground">{bestPaceLabel}</dd>
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
