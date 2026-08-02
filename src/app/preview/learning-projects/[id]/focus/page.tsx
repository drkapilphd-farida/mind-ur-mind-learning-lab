import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { FocusWorkspace } from '@/features/focus-mode-runtime/components'
import { continueFocusSession } from '@/features/focus-mode-runtime/actions/continueFocusSession'
import { findFocusSessionForDocument } from '@/features/focus-mode-runtime/actions/findFocusSessionForDocument'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import type { ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'

export const metadata: Metadata = {
  title: 'Focus Mode',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Focus Mode™ (Mini) Sprint ALS-16 — the real focus session route,
// structurally identical to Memory Mode™'s own real route
// (`/preview/learning-projects/[id]/memory/page.tsx`): same auth +
// ownership pattern as every other `/preview/learning-projects/*` route.
// What renders depends entirely on real, checked state: an existing real
// session (Session Recovery, via `continueFocusSession`), a real ULO with
// no session yet, or a real "not processed yet" gap.
export default async function FocusDocumentPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/focus`)

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

  const initial = await resolveInitialFocusState(supabase, user.id, document.id)

  return <FocusWorkspace documentId={document.id} documentTitle={document.title} initial={initial} projectId={project.id} />
}

async function resolveInitialFocusState(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, documentId: string): Promise<ModeWorkspaceInitialState> {
  const existingSnapshot = await findFocusSessionForDocument(supabase, userId, documentId)

  if (existingSnapshot) {
    const result = await continueFocusSession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return { kind: 'in-progress', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds, didResume: true }
  }

  const ulo = await loadUniversalLearningObject(supabase, documentId)
  return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
}
