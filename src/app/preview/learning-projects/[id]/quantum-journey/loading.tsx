import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2. Mirrors
// `[id]/read/loading.tsx`'s own layout rhythm so real content swapping in
// causes no visible layout shift.
export default function QuantumReadingJourneyLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Reading Journey" className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <AIPresenceLoadingState message="Preparing your reading journey…" />
      <div className="flex items-center justify-between">
        <LoadingCard className="h-6 w-52" />
        <LoadingCard className="h-4 w-12" />
      </div>
      <LoadingCard className="h-48 w-full" />
      <div className="flex items-center justify-center">
        <LoadingCard className="h-9 w-40" />
      </div>
    </section>
  )
}
