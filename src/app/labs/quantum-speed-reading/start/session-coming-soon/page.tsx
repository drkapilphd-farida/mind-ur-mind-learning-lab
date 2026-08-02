import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPassageById } from '@/features/quantum-speed-reading/passageLibrary'
import { getReadingMode } from '@/features/quantum-speed-reading/readingModes'
import { SprintStepIndicator } from '@/features/quantum-speed-reading/components/SprintStepIndicator'

export const metadata: Metadata = {
  title: 'Session Starting — Quantum Speed Reading™',
}

type SessionComingSoonPageProps = {
  searchParams: Promise<{ mode?: string | undefined; passage?: string | undefined }>
}

// Sprint-2 placeholder — deliberately does not touch
// useUniversalExerciseRuntime, savePracticeSession, or any existing
// mission's gating. Honest about scope rather than faking a session.
export default async function SessionComingSoonPage({ searchParams }: SessionComingSoonPageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const passage = params.passage ? getPassageById(params.passage) : null
  const mode = params.mode ? getReadingMode(params.mode) : null

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <SprintStepIndicator currentStep={5} />
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.08]" aria-hidden="true">
        <div className="size-8 rounded-full bg-primary/[0.15]" />
      </div>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-balance text-foreground">
          Your reading session starts here in Sprint 2
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {passage ? `"${passage.title}"` : 'Your passage'} in {mode ? mode.title : 'your selected mode'} is ready — the real
          reading experience is being built next.
        </p>
      </div>
      <Button asChild variant="outline" className="rounded-full transition-transform active:scale-[0.98]">
        <Link href="/labs/quantum-speed-reading">Back to Lab</Link>
      </Button>
    </div>
  )
}
