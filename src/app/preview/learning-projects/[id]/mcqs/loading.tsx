import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// MCQs™ Sprint ALS-17. A skeleton reads as "loading, calmly" — a spinner
// reads as "stuck," the same reasoning every other Learning Mode route's
// own loading.tsx already documents.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading MCQs session" className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <AIPresenceLoadingState message="Preparing your quiz…" />
      <LoadingCard className="h-10 rounded-xl" />
      <LoadingCard className="h-8 rounded-xl" />
      <LoadingCard className="h-64 rounded-2xl sm:h-72" />
      <LoadingCard className="h-12 rounded-xl" />
    </section>
  )
}
