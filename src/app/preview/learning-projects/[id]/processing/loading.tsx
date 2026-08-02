import { LoadingCard } from '@/components/ui/loading-card'

// AI Learning Studio™ Sprint ALS-8 — final consistency audit. Every other
// route in this journey (new, [id], read, memory, notes, workspace) had
// its own route-scoped loading.tsx; this one didn't. A skeleton for the
// brief auth + document-status check ProcessingPage performs before
// ProcessingExperience's own real animated pipeline takes over.
export default function LearningProjectProcessingLoading(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 py-16" aria-busy="true" aria-label="Loading AI Processing Experience">
      <LoadingCard className="size-32 rounded-full" />
      <LoadingCard className="h-8 w-64" />
      <LoadingCard className="h-4 w-80" />
    </div>
  )
}
