import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Quantum Speed Reading™ Production Sprint-2 — Loading States. Mirrors
// the real Reading Workspace's own layout rhythm (title + timer, progress
// bar, chunk card, navigation row) so the real content swapping in causes
// no visible layout shift, the same discipline every other
// `/preview/learning-projects/*` route's own `loading.tsx` already
// follows.
//
// AI Learning Studio™ Sprint ALS-18 — `aria-busy`/`aria-label` added: a
// production consistency audit found this was the one loading state of
// eight missing them (every sibling mode's own `loading.tsx` already had
// both) — a real, screen-reader-relevant gap, now closed. The skeleton
// shape itself is unchanged; only the two attributes were added.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function ReadDocumentLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Reading session" className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <AIPresenceLoadingState message="Preparing your reading experience…" />
      <div className="flex items-center justify-between">
        <LoadingCard className="h-6 w-52" />
        <LoadingCard className="h-4 w-12" />
      </div>
      <LoadingCard className="h-4 w-full" />
      <LoadingCard className="h-48 w-full" />
      <div className="flex items-center justify-between">
        <LoadingCard className="h-9 w-28" />
        <div className="flex gap-2">
          <LoadingCard className="h-9 w-24" />
          <LoadingCard className="h-9 w-20" />
        </div>
        <LoadingCard className="h-9 w-24" />
      </div>
    </section>
  )
}
