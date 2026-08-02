import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ Sprint ALS-1. Blocks approximate `StudioHome`'s own
// active-state section rhythm (Header/Continue-Learning/Projects-grid/CTA)
// — a skeleton, not a spinner, matching every other Learning Mode's own
// Sprint-5 loading.tsx convention applied here from the start.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading AI Learning Studio" className="space-y-10 px-1 pb-4 sm:px-0">
      <AIPresenceLoadingState message="Gathering your Learning Projects…" />
      <LoadingCard className="h-12 w-64 rounded-xl" />
      <LoadingCard className="h-40 max-w-sm rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LoadingCard className="h-40 rounded-xl" />
        <LoadingCard className="h-40 rounded-xl" />
        <LoadingCard className="h-40 rounded-xl" />
      </div>
      <LoadingCard className="h-12 w-64 rounded-full" />
    </section>
  )
}
