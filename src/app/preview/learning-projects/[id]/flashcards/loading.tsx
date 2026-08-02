import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Learning Studio™ Sprint ALS-13. Blocks approximate FlashCardDeckView's
// own section rhythm (Header/Card/Controls).
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton, same reasoning as every sibling
// Learning Mode route.
export default function FlashcardsLoading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading Flashcards" className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <AIPresenceLoadingState message="Preparing your flashcards…" />
      <div className="flex flex-col items-center gap-3">
        <LoadingCard className="size-14 rounded-2xl" />
        <LoadingCard className="h-4 w-24" />
        <LoadingCard className="h-8 w-64" />
      </div>
      <LoadingCard className="h-64 rounded-2xl" />
      <div className="flex justify-center gap-3">
        <LoadingCard className="h-10 w-28 rounded-md" />
        <LoadingCard className="h-10 w-28 rounded-md" />
      </div>
    </section>
  )
}
