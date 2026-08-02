import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPassageById } from '@/features/quantum-speed-reading/passageLibrary'
import { getComprehensionQuestions } from '@/features/quantum-speed-reading/comprehensionQuestions'
import { ComprehensionQuizExperience } from '@/features/quantum-speed-reading/components/comprehension/ComprehensionQuizExperience'

export const metadata: Metadata = {
  title: 'Brain Challenge — Quantum Speed Reading™',
}

type ComprehensionQuizPageProps = {
  searchParams: Promise<{ mode?: string | undefined; passage?: string | undefined; readingTimeMs?: string | undefined; focusMode?: string | undefined }>
}

// Sprint-3 — the real Comprehension Intelligence Engine that Sprint-2's
// "Continue to Questions" button points at. Same not-found guard as every
// prior screen: a missing/invalid passage, or a passage with no authored
// question set, 404s rather than guessing.
export default async function ComprehensionQuizPage({ searchParams }: ComprehensionQuizPageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const passage = params.passage ? getPassageById(params.passage) : null
  if (!passage) notFound()

  const questionSet = getComprehensionQuestions(passage.id)
  if (!questionSet) notFound()

  const readingTimeMs = params.readingTimeMs ? Number(params.readingTimeMs) : 0

  return (
    <ComprehensionQuizExperience
      passage={passage}
      questionSet={questionSet}
      mode={params.mode ?? null}
      readingTimeMs={Number.isFinite(readingTimeMs) ? readingTimeMs : 0}
      focusMode={params.focusMode === 'true'}
    />
  )
}
