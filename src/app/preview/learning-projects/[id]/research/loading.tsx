import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ V1 Living Product Sprint — Research Mode™ had no
// loading.tsx at all until now (a real, confirmed gap — every sibling
// Learning Mode route already has one). Same skeleton rhythm as
// Revision Mode™'s own `../revision/loading.tsx` (structurally the
// closest sibling route), with the shared AIPresenceLoadingState so this
// route's wait reads the same as every other Learning Mode's.
export default function ResearchLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Research session" className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <AIPresenceLoadingState message="Preparing your research session…" />
      <LoadingCard className="h-10 rounded-xl" />
      <LoadingCard className="h-8 rounded-xl" />
      <LoadingCard className="h-64 rounded-2xl sm:h-72" />
      <LoadingCard className="h-12 rounded-xl" />
    </section>
  )
}
