import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Memory Mode™ Sprint-5 — Premium Apple-quality UX Polish™. A skeleton
// reads as "loading, calmly" — a spinner reads as "stuck," the same
// reasoning QSR's own `/labs/quantum-speed-reading/loading.tsx` already
// documents. Four blocks approximate the Header/Progress/Card/Controls
// sections `MemoryWorkspace` renders once its real initial state
// resolves. New file — no existing loading.tsx to preserve, no Sprint-2
// component touched.
//
// AI Learning Studio™ V1 Living Product Sprint — the real skeleton shape
// stays (avoids layout shift), with the shared AIPresenceLoadingState
// added above it so this wait finally answers "what's happening."
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Memory session" className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <AIPresenceLoadingState message="Preparing your memory session…" />
      <LoadingCard className="h-10 rounded-xl" />
      <LoadingCard className="h-8 rounded-xl" />
      <LoadingCard className="h-64 rounded-2xl sm:h-72" />
      <LoadingCard className="h-12 rounded-xl" />
    </section>
  )
}
