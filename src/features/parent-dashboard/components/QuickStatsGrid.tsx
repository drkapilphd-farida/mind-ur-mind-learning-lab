import { BookOpen, Gauge, Target, Clock3, TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklySnapshot } from '../types'

type StatCardProps = {
  icon: LucideIcon
  iconClass: string
  label: string
  value: string
  trendLabel?: string
  trendDirection?: 'up' | 'down'
}

// A single metric tile — shared shape for all four stats below so the
// grid stays visually consistent regardless of which number is biggest.
function StatCard({ icon: Icon, iconClass, label, value, trendLabel, trendDirection }: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={cn('flex size-10 items-center justify-center rounded-xl', iconClass)}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>

      {trendLabel && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trendDirection === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
          )}
        >
          {trendDirection === 'up' ? (
            <TrendingUp className="size-3.5" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3.5" aria-hidden="true" />
          )}
          {trendLabel}
        </div>
      )}
    </div>
  )
}

// Visual Quick Stats & Metrics Grid — the four numbers a parent actually
// scans for first: how much was read, how much faster, how well it was
// understood, and how the screen time split between real learning and
// distraction. All four are derived directly from the selected child's
// WeeklySnapshot — nothing here is a fabricated or rounded-for-effect
// number beyond simple, disclosed arithmetic (e.g. week-over-week delta).
export function QuickStatsGrid({ snapshot }: { snapshot: WeeklySnapshot }): React.JSX.Element {
  const booksDelta = snapshot.booksRead - snapshot.booksReadLastWeek
  const totalScreenMinutes = snapshot.productiveMinutes + snapshot.distractionMinutes
  const productivePercent = totalScreenMinutes > 0 ? Math.round((snapshot.productiveMinutes / totalScreenMinutes) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={BookOpen}
        iconClass="bg-indigo-50 text-indigo-600"
        label="Books Read This Week"
        value={String(snapshot.booksRead)}
        trendLabel={booksDelta === 0 ? 'Same as last week' : `${Math.abs(booksDelta)} vs last week`}
        trendDirection={booksDelta >= 0 ? 'up' : 'down'}
      />

      <StatCard
        icon={Gauge}
        iconClass="bg-emerald-50 text-emerald-600"
        label="Quantum Reading Speed Boost"
        value={`+${snapshot.readingSpeedBoostPercent}%`}
        trendLabel="Faster than baseline"
        trendDirection="up"
      />

      <StatCard
        icon={Target}
        iconClass="bg-indigo-50 text-indigo-600"
        label="Avg. Quiz Comprehension"
        value={`${snapshot.comprehensionScorePercent}%`}
        trendLabel={snapshot.comprehensionScorePercent >= 75 ? 'Strong understanding' : 'Needs reinforcement'}
        trendDirection={snapshot.comprehensionScorePercent >= 75 ? 'up' : 'down'}
      />

      <StatCard
        icon={Clock3}
        iconClass="bg-emerald-50 text-emerald-600"
        label="Productive Screen Time"
        value={`${productivePercent}%`}
        trendLabel={`${snapshot.productiveMinutes}m learning · ${snapshot.distractionMinutes}m distraction`}
        trendDirection={productivePercent >= 60 ? 'up' : 'down'}
      />
    </div>
  )
}
