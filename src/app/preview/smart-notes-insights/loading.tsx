import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Smart Notes™ Sprint-5 — Production Polish. Blocks approximate the
// Header/Summary-Cards/Timeline/two-column/Insights/Session-list
// sections `SmartNotesProgressDashboard` renders once its real data
// resolves, matching Memory's own
// `/preview/memory-insights/loading.tsx` exactly. New file — no
// existing loading.tsx to preserve, no Sprint-4 component touched.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Smart Notes Progress dashboard" className="space-y-8 px-1 pb-4 sm:px-0">
      <AIPresenceLoadingState message="Gathering your notes insights…" />
      <LoadingCard className="h-12 w-64 rounded-xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <LoadingCard className="h-24 rounded-xl" />
        <LoadingCard className="h-24 rounded-xl" />
        <LoadingCard className="h-24 rounded-xl" />
        <LoadingCard className="h-24 rounded-xl" />
        <LoadingCard className="h-24 rounded-xl" />
      </div>
      <LoadingCard className="h-48 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LoadingCard className="h-40 rounded-xl" />
        <LoadingCard className="h-40 rounded-xl" />
      </div>
      <LoadingCard className="h-32 rounded-xl" />
      <LoadingCard className="h-64 rounded-xl" />
    </section>
  )
}
