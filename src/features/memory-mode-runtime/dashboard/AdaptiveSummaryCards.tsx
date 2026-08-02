import { CalendarCheck, Flame, Gauge, Layers, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { AdaptiveSummaryCardData } from '../analytics'

type AdaptiveSummaryCardsProps = {
  cards: readonly AdaptiveSummaryCardData[]
}

const CARD_ICON: Record<string, LucideIcon> = {
  'sessions-completed': CalendarCheck,
  'average-confidence': Gauge,
  'current-streak': Flame,
  'concepts-strong': Layers,
}

function formatCardValue(value: number, unit: AdaptiveSummaryCardData['unit']): string {
  if (unit === 'percentage') return `${value}%`
  if (unit === 'days') return `${value} ${value === 1 ? 'day' : 'days'}`
  return String(value)
}

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Adaptive Summary
// Cards (item 8). A Server Component — this dashboard is entirely
// read-only, so no client boundary is needed anywhere in it, avoiding the
// class of bug Sprint-2 hit when a client component pulled server-only
// code through a shared barrel. Reuses the same `Card`/`CardHeader`/
// `CardTitle` + `TYPOGRAPHY` pattern the real `/preview/dashboard`
// StatCard already established, rather than inventing a second card
// convention.
//
// Memory Mode™ Sprint-5 polish: each card gets a small, real icon keyed
// off its own real `id` (never a new field — `AdaptiveSummaryCardData`
// is unchanged) for faster visual scanning, consistent with "premium
// cards." Falls back to no icon for any future card id this lookup
// doesn't recognize, rather than crashing on a missing entry.
export function AdaptiveSummaryCards({ cards }: AdaptiveSummaryCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = CARD_ICON[card.id]
        return (
          <Card key={card.id}>
            <CardHeader>
              {Icon !== undefined && <Icon className={`${ICON_SIZE.md} mb-1 text-muted-foreground`} aria-hidden="true" />}
              <CardTitle className="text-2xl tabular-nums">{formatCardValue(card.value, card.unit)}</CardTitle>
              <p className={TYPOGRAPHY.caption}>{card.label}</p>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
