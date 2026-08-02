import { LoadingCard } from '@/components/ui/loading-card'

// Sprint-15 — Premium Interaction Review™. Confirmed via audit: this route's
// Server Component awaits 6+ data calls (streak/DNA/neural evolution/coach
// message/weekly+calendar activity/achievements) before rendering
// DashboardExperience — previously had no loading.tsx, so a slow fetch left
// the learner staring at the frozen previous page. Mirrors the existing
// quantum-speed-reading dashboard's skeleton pattern (stacked LoadingCard
// blocks), sized to roughly approximate Hero/Rings/Achievements/Activity.
export default function Loading(): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <LoadingCard className="h-48 rounded-3xl" />
      <LoadingCard className="h-40 rounded-3xl" />
      <LoadingCard className="h-56 rounded-3xl" />
      <LoadingCard className="h-32 rounded-3xl" />
    </div>
  )
}
