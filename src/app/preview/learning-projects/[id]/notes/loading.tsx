import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Smart Notes™ Sprint-5 — Production Polish. A skeleton reads as
// "loading, calmly" — a spinner reads as "stuck," the same reasoning
// QSR's own `/labs/quantum-speed-reading/loading.tsx` and Memory's own
// `/preview/learning-projects/[id]/memory/loading.tsx` already document.
// Blocks approximate the Header/Progress/Card/Controls/Notes sections
// `SmartNotesWorkspace` renders once its real initial state resolves.
// New file — no existing loading.tsx to preserve, no Sprint-1/2
// component touched.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Smart Notes session" className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <AIPresenceLoadingState message="Gathering your notes…" />
      <LoadingCard className="h-10 rounded-xl" />
      <LoadingCard className="h-8 rounded-xl" />
      <LoadingCard className="h-64 rounded-2xl sm:h-72" />
      <LoadingCard className="h-12 rounded-xl" />
      <LoadingCard className="h-56 rounded-xl" />
    </section>
  )
}
