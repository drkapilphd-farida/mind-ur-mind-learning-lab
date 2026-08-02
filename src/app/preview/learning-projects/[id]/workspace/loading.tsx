import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ Sprint ALS-5. Blocks approximate LearningWorkspaceShell's
// own section rhythm (Header/Document card/Session card/Controls).
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Learning Workspace" className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <AIPresenceLoadingState message="Preparing your learning workspace…" />
      <LoadingCard className="mx-auto h-24 w-24 rounded-2xl" />
      <LoadingCard className="h-28 rounded-xl" />
      <LoadingCard className="h-40 rounded-xl" />
      <LoadingCard className="mx-auto h-11 w-56 rounded-full" />
    </section>
  )
}
