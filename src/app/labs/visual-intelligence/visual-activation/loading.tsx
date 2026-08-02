import { LoadingCard } from '@/components/ui/loading-card'

// Sprint-15 — Premium Interaction Review™. Confirmed via audit: this route's
// Server Component awaits 6 data calls (neural evolution, Visual DNA score,
// today's Image Persistence sequence/report, Tratak streak) before
// rendering VisualActivationSequence — the very first stage of the guided
// journey, reached directly from the dashboard's primary CTA. Previously
// had no loading.tsx. One block approximates the single centered exercise
// card every step in this sequence renders.
export default function Loading(): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
      <LoadingCard className="h-96 rounded-3xl" />
    </div>
  )
}
