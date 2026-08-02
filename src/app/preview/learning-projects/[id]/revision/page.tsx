import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { RevisionWorkspace } from '@/features/revision-mode-runtime/components'
import { continueRevisionSession } from '@/features/revision-mode-runtime/actions/continueRevisionSession'
import { findRevisionSessionForDocument } from '@/features/revision-mode-runtime/actions/findRevisionSessionForDocument'
import { getDocumentRevisionContext } from '@/features/revision-mode-runtime/queries/getDocumentRevisionContext'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import type { ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'

export const metadata: Metadata = {
  title: 'Revision',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Revision Mode™ Sprint ALS-17 — the real revision session route,
// structurally identical to Memory Mode™'s own real route. The one real
// difference: this route always computes the real, cross-session
// `revisionContext` (via `getDocumentRevisionContext`) so the not-started
// screen can show the learner's own real history before they start.
export default async function RevisionDocumentPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/revision`)

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

  const [initial, revisionContext] = await Promise.all([resolveInitialRevisionState(supabase, user.id, document.id), getDocumentRevisionContext(supabase, user.id, document.id)])

  return <RevisionWorkspace documentId={document.id} documentTitle={document.title} revisionContext={revisionContext} initial={initial} projectId={project.id} />
}

async function resolveInitialRevisionState(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, documentId: string): Promise<ModeWorkspaceInitialState> {
  const existingSnapshot = await findRevisionSessionForDocument(supabase, userId, documentId)

  if (existingSnapshot) {
    const result = await continueRevisionSession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return { kind: 'in-progress', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds, didResume: true }
  }

  const ulo = await loadUniversalLearningObject(supabase, documentId)
  return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
}
