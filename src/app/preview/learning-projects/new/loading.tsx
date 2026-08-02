import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ Sprint ALS-8 — final consistency audit. A skeleton
// for the brief auth check NewLearningProjectPage performs before
// NewLearningProjectWizard's own real 3-step Client Component takes over.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function NewLearningProjectLoading(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-12" aria-busy="true" aria-label="Loading Start New Learning Project">
      <AIPresenceLoadingState message="Getting things ready…" />
      <div className="flex flex-col items-center gap-3">
        <LoadingCard className="size-14 rounded-2xl" />
        <LoadingCard className="h-4 w-32" />
      </div>
      <LoadingCard className="mx-auto h-4 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} className="h-28 rounded-3xl" />
        ))}
      </div>
    </div>
  )
}
