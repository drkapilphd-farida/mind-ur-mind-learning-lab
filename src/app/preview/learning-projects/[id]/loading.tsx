import { LoadingCard } from '@/components/ui/loading-card'
import { AIPresenceLoadingState } from '@/components/learning/AIPresenceLoadingState'

// Sprint 2, Chunk 4 — a section-shaped skeleton for the Learning
// Blueprint™ page, scoped to this one route (not the shared
// /preview/loading.tsx, which every other /preview page also uses).
// Mirrors the real page's section rhythm — same max-w-3xl wrapper, same
// section order and rough proportions — so the real content swapping in
// causes no visible layout shift.
//
// AI Learning Studio™ V1 Living Product Sprint — AIPresenceLoadingState
// added above the existing skeleton.
export default function LearningProjectLoading(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <AIPresenceLoadingState message="Preparing your learning mission…" />

      {/* Hero */}
      <div className="space-y-3">
        <LoadingCard className="h-4 w-40" />
        <LoadingCard className="h-9 w-2/3" />
        <LoadingCard className="h-4 w-48" />
        <LoadingCard className="h-14 w-full" />
        <div className="flex flex-wrap gap-3">
          <LoadingCard className="h-5 w-28" />
          <LoadingCard className="h-5 w-24" />
          <LoadingCard className="h-5 w-32" />
          <LoadingCard className="h-5 w-36" />
        </div>
        <LoadingCard className="h-1.5 w-full max-w-md" />
        <LoadingCard className="h-10 w-56 rounded-full" />
      </div>

      {/* Blueprint Overview */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-32" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <LoadingCard key={index} className="h-24" />
          ))}
        </div>
      </div>

      {/* Project Progress */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-32" />
        <LoadingCard className="h-56" />
      </div>

      {/* Primary Concepts */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingCard key={index} className="h-24" />
          ))}
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-24" />
        <LoadingCard className="h-40" />
      </div>

      {/* Topics */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-20" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingCard key={index} className="h-5 w-24" />
          ))}
        </div>
      </div>

      {/* Learning Journey™ */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-36" />
        <LoadingCard className="h-80" />
      </div>

      {/* Knowledge Map Preview */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-44" />
        <div className="max-w-xl space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingCard key={index} className="h-16" />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-24" />
        <LoadingCard className="h-80" />
      </div>

      {/* Study Modes */}
      <div className="space-y-3">
        <LoadingCard className="h-3 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <LoadingCard key={index} className="h-28" />
          ))}
        </div>
      </div>
    </div>
  )
}
