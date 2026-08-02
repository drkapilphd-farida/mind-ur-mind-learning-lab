import { CalendarCheck, FileText, Flame, Gauge, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { SmartNotesSummaryCardData } from '../analytics'

type SmartNotesSummaryCardsProps = {
  cards: readonly SmartNotesSummaryCardData[]
}

const CARD_ICON: Record<string, LucideIcon> = {
  'sessions-completed': CalendarCheck,
  'average-engagement': Gauge,
  'current-streak': Flame,
  'strong-sessions': Gauge,
  'documents-with-notes': FileText,
}

function formatCardValue(value: number, unit: SmartNotesSummaryCardData['unit']): string {
  if (unit === 'percentage') return `${value}%`
  if (unit === 'days') return `${value} ${value === 1 ? 'day' : 'days'}`
  return String(value)
}

// Smart Notes™ Sprint-4 — Analytics & Insights™. Summary Cards. A Server
// Component — this dashboard is entirely read-only, so no client
// boundary is needed anywhere in it. Reuses the same `Card`/`CardHeader`/
// `CardTitle` + `TYPOGRAPHY` pattern the real `/preview/dashboard`
// StatCard and Memory's own `/preview/memory-insights` dashboard already
// established. Mirrors Memory Mode™'s own `AdaptiveSummaryCards`
// (Sprint-4) exactly.
export function SmartNotesSummaryCards({ cards }: SmartNotesSummaryCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
