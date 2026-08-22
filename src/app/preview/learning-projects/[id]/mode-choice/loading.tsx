import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Mode A / Mode B Fork™ (Phase 2) — mirrors the two-card layout rhythm
// so the real content swapping in causes no visible layout shift, the
// same discipline every other `/preview/learning-projects/*` route's own
// `loading.tsx` already follows.
export default function ModeChoiceLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading study mode choices" className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <AIPresenceLoadingState message="Getting your study options ready…" />
      <div className="flex flex-col items-center gap-2">
        <LoadingCard className="h-4 w-40" />
        <LoadingCard className="h-8 w-80" />
        <LoadingCard className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <LoadingCard className="h-72 w-full rounded-3xl" />
        <LoadingCard className="h-72 w-full rounded-3xl" />
      </div>
    </section>
  )
}
