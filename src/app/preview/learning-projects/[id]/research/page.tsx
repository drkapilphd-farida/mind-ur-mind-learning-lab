import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { ResearchWorkspace } from '@/features/research-mode-runtime/components'
import { continueResearchSession } from '@/features/research-mode-runtime/actions/continueResearchSession'
import { findResearchSessionForDocument } from '@/features/research-mode-runtime/actions/findResearchSessionForDocument'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import type { ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'

export const metadata: Metadata = {
  title: 'Research',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Research Mode™ — Production AI Integration (ALS-24) — the real research
// session route, structurally identical to Revision Mode™'s own real
// route (minus the cross-session history read Research Mode has no
// equivalent for).
export default async function ResearchDocumentPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/research`)

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

  const initial = await resolveInitialResearchState(supabase, user.id, document.id)

  return <ResearchWorkspace documentId={document.id} documentTitle={document.title} initial={initial} projectId={project.id} />
}

async function resolveInitialResearchState(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, documentId: string): Promise<ModeWorkspaceInitialState> {
  const existingSnapshot = await findResearchSessionForDocument(supabase, userId, documentId)

  if (existingSnapshot) {
    const result = await continueResearchSession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return { kind: 'in-progress', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds, didResume: true }
  }

  const ulo = await loadUniversalLearningObject(supabase, documentId)
  return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
}
