import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { MemoryWorkspace } from '@/features/memory-mode-runtime/components'
import { continueMemorySession } from '@/features/memory-mode-runtime/actions/continueMemorySession'
import { findMemorySessionForDocument } from '@/features/memory-mode-runtime/actions/findMemorySessionForDocument'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import type { ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'

export const metadata: Metadata = {
  title: 'Memory Mode',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Memory Mode™ Sprint-2 — the real memory session route, structurally
// identical to Quantum Speed Reading™'s own real reading route
// (`/preview/learning-projects/[id]/read/page.tsx`): same auth +
// ownership pattern as every other `/preview/learning-projects/*` route.
// What renders depends entirely on real, checked state: an existing real
// session (Session Recovery, via `continueMemorySession` — the real
// restore, not a guess), a real ULO with no session yet, or a real "not
// processed yet" gap — the same three honest states QSR's own route
// names.
export default async function MemoryDocumentPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/memory`)

  const project = await getLearningProject(user.id, id)
  if (!project) notFound()

  const documents = await listDocuments(user.id, id)
  const document = documents[0]

  if (!document) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyStateCard
          icon={FileQuestion}
          title="No document found for this Learning Project"
          description="This Learning Project doesn't have a document attached yet."
          action={
            <Button asChild variant="outline">
              <Link href={`/preview/learning-projects/${id}`}>Back to Learning Project</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const initial = await resolveInitialMemoryState(supabase, user.id, document.id)

  return <MemoryWorkspace documentId={document.id} documentTitle={document.title} chunkStrategy="review-first" initial={initial} projectId={project.id} />
}

async function resolveInitialMemoryState(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, documentId: string): Promise<ModeWorkspaceInitialState> {
  const existingSnapshot = await findMemorySessionForDocument(supabase, userId, documentId)

  if (existingSnapshot) {
    const result = await continueMemorySession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return { kind: 'in-progress', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds, didResume: true }
  }

  const ulo = await loadUniversalLearningObject(supabase, documentId)
  return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
}
