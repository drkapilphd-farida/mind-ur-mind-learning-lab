import { LoadingCard } from '@/components/ui/loading-card'

// Sprint-15 — Premium Interaction Review™. Confirmed via audit: this route's
// Server Component awaits 4 data calls (visual prep/fixation/persistence
// sessions plus Tratak mission progress) before rendering
// TratakJourneyLanding — the primary Tratak mission hub. Previously had no
// loading.tsx. Blocks approximate the stats header plus the mission list.
export default function Loading(): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <LoadingCard className="h-40 rounded-3xl" />
      <LoadingCard className="h-24 rounded-2xl" />
      <LoadingCard className="h-24 rounded-2xl" />
      <LoadingCard className="h-24 rounded-2xl" />
    </div>
  )
}
