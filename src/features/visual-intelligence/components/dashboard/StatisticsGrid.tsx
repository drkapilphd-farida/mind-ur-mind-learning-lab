import type { DashboardStats } from '../../dashboard/dashboardStatsEngine'

type StatTile = {
  label: string
  value: string
}

type StatisticsGridProps = {
  stats: DashboardStats
}

export function StatisticsGrid({ stats }: StatisticsGridProps): React.JSX.Element {
  const tiles: readonly StatTile[] = [
    { label: 'Total Sessions', value: String(stats.totalSessions) },
    { label: 'Training Minutes', value: String(stats.trainingMinutes) },
    { label: 'Current Streak', value: `${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}` },
    { label: 'Longest Streak', value: `${stats.longestStreak} day${stats.longestStreak === 1 ? '' : 's'}` },
    { label: 'Average Accuracy', value: stats.averageAccuracy === null ? 'Train more to unlock' : `${stats.averageAccuracy}%` },
    { label: 'Visual Score', value: `${stats.visualScore} / 1000` },
    { label: 'Visual DNA Level', value: stats.visualDnaLevel },
    { label: 'XP', value: String(stats.xp) },
    { label: 'Mind Score', value: `${stats.mindScore} / 1000` },
  ]

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Statistics™</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border p-4">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{tile.label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{tile.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Mind Score currently equals your Visual Score, since no other Intelligence Lab contributes to it yet.
      </p>
    </div>
  )
}
