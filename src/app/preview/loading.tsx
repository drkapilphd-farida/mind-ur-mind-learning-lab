import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ V1 Living Product Sprint — the generic top-level
// `/preview/*` fallback. AIPresenceLoadingState added above the existing
// skeleton so this catch-all never reads as a blank/stuck screen either.
export default function Loading(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <AIPresenceLoadingState message="Just a moment…" />
      <LoadingCard className="h-8 w-40" />
      <LoadingCard className="h-36" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LoadingCard className="h-28" />
        <LoadingCard className="h-28" />
      </div>
    </div>
  )
}
