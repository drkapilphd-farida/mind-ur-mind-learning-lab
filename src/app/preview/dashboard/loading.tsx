import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ V1 Living Product Sprint — the real dashboard entry
// route had no loading.tsx at all (a real, confirmed gap — it fell back
// to the generic top-level `/preview/loading.tsx`, whose four textless
// blocks don't match this page's own shape). Blocks approximate the
// page's own real section rhythm (Greeting/Continue-Learning/Stats/
// Projects-grid) once its real data resolves.
export default function DashboardLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Dashboard" className="space-y-10">
      <AIPresenceLoadingState message="Good to see you — getting your dashboard ready…" />
      <LoadingCard className="h-9 w-72 rounded-xl" />
      <LoadingCard className="h-32 max-w-sm rounded-xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <LoadingCard className="h-20 rounded-xl" />
        <LoadingCard className="h-20 rounded-xl" />
        <LoadingCard className="h-20 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LoadingCard className="h-40 rounded-xl" />
        <LoadingCard className="h-40 rounded-xl" />
        <LoadingCard className="h-40 rounded-xl" />
      </div>
    </section>
  )
}
