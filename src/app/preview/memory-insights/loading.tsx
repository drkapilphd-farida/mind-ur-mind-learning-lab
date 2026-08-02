import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Memory Mode™ Sprint-5 — Premium Apple-quality UX Polish™. Blocks
// approximate the Header/Summary-Cards/Timeline/two-column/Insights/
// Session-list sections `MemoryProgressDashboard` renders once its real
// data resolves. New file — no existing loading.tsx to preserve, no
// Sprint-4 component touched.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Memory Progress dashboard" className="space-y-8 px-1 pb-4 sm:px-0">
      <AIPresenceLoadingState message="Preparing your memory insights…" />
      <LoadingCard className="h-12 w-64 rounded-xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
