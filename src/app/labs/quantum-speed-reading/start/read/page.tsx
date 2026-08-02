import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPassageById } from '@/features/quantum-speed-reading/passageLibrary'
import { ReadingExperience } from '@/features/quantum-speed-reading/components/reading-experience/ReadingExperience'

export const metadata: Metadata = {
  title: 'Reading — Quantum Speed Reading™',
}

type ReadingScreenPageProps = {
  searchParams: Promise<{ mode?: string | undefined; passage?: string | undefined }>
}

// Sprint-2 — the real Reading Screen that Sprint-1's "Begin Reading" button
// points at. Same not-found guard as start/prepare/page.tsx: a missing or
// invalid passage id 404s rather than guessing.
export default async function ReadingScreenPage({ searchParams }: ReadingScreenPageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const passage = params.passage ? getPassageById(params.passage) : null
  if (!passage) notFound()

  return <ReadingExperience passage={passage} mode={params.mode ?? null} />
}
