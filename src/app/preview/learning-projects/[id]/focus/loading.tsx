import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Focus Mode™ (Mini) Sprint ALS-16. A skeleton reads as "loading,
// calmly" — a spinner reads as "stuck," the same reasoning every other
// Learning Mode route's own loading.tsx already documents. Four blocks
// approximate the Header/Progress/Card/Controls sections `FocusWorkspace`
// renders once its real initial state resolves.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Focus session" className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <AIPresenceLoadingState message="Preparing your focus session…" />
      <LoadingCard className="h-10 rounded-xl" />
      <LoadingCard className="h-8 rounded-xl" />
      <LoadingCard className="h-64 rounded-2xl sm:h-72" />
      <LoadingCard className="h-12 rounded-xl" />
    </section>
  )
}
