import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Layers } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { getGeneratedLearningContent, saveGeneratedLearningContent } from '@/api/generatedLearningContent'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { FlashCardDeckView } from '@/components/learning/FlashCardDeckView'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { generateFlashCards } from '@/lib/learning-modes/generateFlashCards'
import type { FlashCardDeck } from '@/lib/learning-modes/generateFlashCards'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { isWorkspaceAccessible } from '@/types/documents'

export const metadata: Metadata = {
  title: 'Flashcards',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// AI Learning Studio™ Sprint ALS-13 — Flashcards™. Same auth + ownership
// + document-status pattern as every other `/preview/learning-projects/*`
// route. Real "generate once, cache, display instantly": on first visit,
// builds a real deck of structural review cards from the real Universal
// Learning Object™ (`generateFlashCards` — no AI, no fabricated
// questions/answers, see that function's own comment) and persists it;
// every later visit is a real cache hit. A cache-write failure is
// disclosed (logged) but never blocks showing the real, freshly-generated
// deck the learner is already looking at.
//
// AI Learning Studio™ Sprint ALS-18 — the not-processed title now names
// this mode explicitly ("...for Flashcards™ yet"), matching the wording
// convention every stepped-session mode's own empty state already uses —
// a production consistency audit found this was the one pair (with Mind
// Map™) that omitted it.
export default async function FlashcardsPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/flashcards`)

  const project = await getLearningProject(user.id, id)
  if (!project) notFound()

  const documents = await listDocuments(user.id, id)
  const document = documents[0]
  if (!document) notFound()

  if (!isWorkspaceAccessible(document.status)) {
    redirect(`/preview/learning-projects/${id}`)
  }

  const cached = await getGeneratedLearningContent<FlashCardDeck>(document.id, 'flashcards')
  let deck = cached

  if (!deck) {
    const ulo = await loadUniversalLearningObject(supabase, document.id)
    if (!ulo) {
      return (
        <div className="mx-auto max-w-lg px-6 py-16">
          <EmptyStateCard
            icon={Layers}
            title="This document hasn't been prepared for Flashcards™ yet"
            description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes."
            action={
              <Button asChild variant="outline">
                <Link href={`/preview/learning-projects/${id}`}>Back to Learning Blueprint</Link>
              </Button>
            }
          />
        </div>
      )
    }

    // ALS-15 Instant Learning Engine™ — `generated_learning_content` has
    // no TTL/invalidation, so generating a deck before Phase 3
    // "Background AI Intelligence" has fully finished would permanently
    // freeze it at structural-only quality. Gate on real, full
    // completion (`'ready'`), not merely "workspace accessible" — a
    // document still at `'workspace_ready'` shows an honest "still being
    // prepared" state instead of an early, permanently-cached deck.
    if (document.status !== 'ready') {
      return (
        <div className="mx-auto max-w-lg px-6 py-16">
          <EmptyStateCard
            icon={Layers}
            title="Flashcards™ are still being prepared"
            description="We're still understanding this document — check back in a moment for richer cards."
            action={
              <Button asChild variant="outline">
                <Link href={`/preview/learning-projects/${id}`}>Back to Learning Blueprint</Link>
              </Button>
            }
          />
        </div>
      )
    }

    deck = generateFlashCards(ulo)

    try {
      await saveGeneratedLearningContent(document.id, 'flashcards', deck)
    } catch (error) {
      logger.error('failed to cache generated Flashcards deck', { error: error instanceof Error ? error.message : String(error), documentId: document.id })
    }
  }

  return <FlashCardDeckView projectId={project.id} deck={deck} />
}
