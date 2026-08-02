import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ Sprint ALS-13. Blocks approximate MindMapOutlineView's
// own section rhythm (Header/Outline card/Controls).
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton, same reasoning as every sibling
// Learning Mode route.
export default function MindMapLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Mind Map" className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <AIPresenceLoadingState message="Mapping your concepts…" />
      <div className="flex flex-col items-center gap-3">
        <LoadingCard className="size-14 rounded-2xl" />
        <LoadingCard className="h-4 w-24" />
        <LoadingCard className="h-8 w-64" />
      </div>
      <LoadingCard className="h-64 rounded-xl" />
      <LoadingCard className="mx-auto h-9 w-48" />
    </section>
  )
}
