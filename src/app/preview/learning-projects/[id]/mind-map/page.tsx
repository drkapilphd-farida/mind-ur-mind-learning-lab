import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Map as MapIcon } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { getGeneratedLearningContent, saveGeneratedLearningContent } from '@/api/generatedLearningContent'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { MindMapOutlineView } from '@/components/learning/MindMapOutlineView'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { generateMindMapOutline } from '@/lib/learning-modes/generateMindMapOutline'
import type { MindMapOutline } from '@/lib/learning-modes/generateMindMapOutline'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { isWorkspaceAccessible } from '@/types/documents'

export const metadata: Metadata = {
  title: 'Mind Map',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// AI Learning Studio™ Sprint ALS-13 — Mind Map™. Same auth + ownership +
// document-status pattern as every other `/preview/learning-projects/*`
// route. Real "generate once, cache, display instantly": on first visit,
// builds a real outline from the real Universal Learning Object™
// (`generateMindMapOutline` — no AI, no fabrication, see that function's
// own comment for exactly why this is an outline, not a concept map) and
// persists it; every later visit is a real cache hit, no re-generation,
// no re-processing of the uploaded file. A cache-write failure is
// disclosed (logged) but never blocks showing the real, freshly-generated
// outline the learner is already looking at.
//
// AI Learning Studio™ Sprint ALS-18 — the not-processed title now names
// this mode explicitly ("...for Mind Map™ yet"), matching the wording
// convention every stepped-session mode's own empty state already uses —
// a production consistency audit found this was the one pair (with
// Flashcards™) that omitted it.
export default async function MindMapPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/mind-map`)

  const project = await getLearningProject(user.id, id)
  if (!project) notFound()

  const documents = await listDocuments(user.id, id)
  const document = documents[0]
  if (!document) notFound()

  if (!isWorkspaceAccessible(document.status)) {
    redirect(`/preview/learning-projects/${id}`)
  }

  const cached = await getGeneratedLearningContent<MindMapOutline>(document.id, 'mind-map')
  let outline = cached

  if (!outline) {
    const ulo = await loadUniversalLearningObject(supabase, document.id)
    if (!ulo) {
      return (
        <div className="mx-auto max-w-lg px-6 py-16">
          <EmptyStateCard
            icon={MapIcon}
            title="This document hasn't been prepared for Mind Map™ yet"
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

    // ALS-15 Instant Learning Engine™ — same premature-cache guard as
    // Flashcards™: gate on real, full Phase 3 completion (`'ready'`), not
    // merely "workspace accessible," so a partially-enriched outline is
    // never permanently cached.
    if (document.status !== 'ready') {
      return (
        <div className="mx-auto max-w-lg px-6 py-16">
          <EmptyStateCard
            icon={MapIcon}
            title="Mind Map™ is still being prepared"
            description="We're still mapping concept relationships in this document — check back in a moment."
            action={
              <Button asChild variant="outline">
                <Link href={`/preview/learning-projects/${id}`}>Back to Learning Blueprint</Link>
              </Button>
            }
          />
        </div>
      )
    }

    outline = generateMindMapOutline(ulo)

    try {
      await saveGeneratedLearningContent(document.id, 'mind-map', outline)
    } catch (error) {
      logger.error('failed to cache generated Mind Map outline', { error: error instanceof Error ? error.message : String(error), documentId: document.id })
    }
  }

  return <MindMapOutlineView projectId={project.id} outline={outline} />
}
