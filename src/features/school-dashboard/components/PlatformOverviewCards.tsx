import { Building2, Sparkles, TriangleAlert, Users } from 'lucide-react'
import { getPlatformOverviewStats } from '../queries/getPlatformOverviewStats'

// A subtle card-to-transparent gradient + a tinted icon chip — both
// built entirely from existing design tokens (bg-card, bg-primary/N%),
// never a raw hex value, per DESIGN_SYSTEM.md's "reference the token"
// rule. The lift over the previous flat card is the gradient + chip,
// not a new color.
export async function PlatformOverviewCards(): Promise<React.JSX.Element> {
  const stats = await getPlatformOverviewStats()

  const cards = [
    {
      label: 'Schools & Partners',
      value: stats.schoolCount + stats.partnerCount,
      sub: `${stats.schoolCount} school${stats.schoolCount !== 1 ? 's' : ''} · ${stats.partnerCount} partner${stats.partnerCount !== 1 ? 's' : ''}`,
      icon: Building2,
    },
    {
      label: 'Students Enrolled',
      value: stats.totalStudents,
      sub: `of ${stats.totalSeats} seats across active tenants`,
      icon: Users,
    },
    {
      label: 'AI Documents Processed',
      value: stats.aiUsageThisMonth,
      sub: `of ${stats.totalAiQuota} monthly quota, this month`,
      icon: Sparkles,
    },
    {
      label: 'Subscriptions',
      value: stats.subscriptionStatusCounts.active,
      sub: `${stats.subscriptionStatusCounts.expiring_soon} expiring soon · ${stats.subscriptionStatusCounts.expired} expired`,
      icon: TriangleAlert,
    },
  ]

  return (
    <section className="space-y-4">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Platform overview</p>
        <p className="text-muted-foreground mt-0.5 text-sm">Real-time metrics across every school and franchise partner.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gradient-to-br from-card to-muted/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <card.icon className="size-4.5" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">{card.value}</p>
            <p className="text-foreground mt-1 text-sm font-medium">{card.label}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{card.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
