import { LoadingCard } from '@/components/ui/loading-card'

// Sprint-12D — Motion Language™. A skeleton reads as "loading, calmly" —
// a spinner reads as "stuck." Three blocks approximate the Hero/Metrics/
// Timeline sections that render once data resolves.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Quantum Speed Reading experience" className="mx-auto max-w-2xl space-y-10 px-6 py-16 sm:py-20">
      <LoadingCard className="h-56 rounded-3xl" />
      <LoadingCard className="h-64 rounded-3xl" />
      <LoadingCard className="h-96 rounded-3xl" />
    </section>
  )
}
