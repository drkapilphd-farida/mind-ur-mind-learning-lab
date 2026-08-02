import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// AI Mentor™ Sprint-5 — Production Polish. A skeleton reads as "loading,
// calmly" — a spinner reads as "stuck," the same reasoning every other
// Learning Mode's own loading.tsx already documents. Blocks approximate
// the Header/Progress/Suggestions/Conversation sections
// `AiMentorWorkspace` renders once its real initial state resolves. New
// file — no existing loading.tsx to preserve, no Sprint-1–4 component
// touched.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function Loading(): React.JSX.Element {
  return (
    <section aria-busy="true" aria-label="Loading AI Mentor" className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <AIPresenceLoadingState message="Connecting you with your AI Mentor…" />
      <LoadingCard className="h-40 rounded-xl" />
      <LoadingCard className="h-24 rounded-xl" />
      <LoadingCard className="h-56 rounded-xl" />
    </section>
  )
}
