import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { McqsWorkspace } from '@/features/mcqs-mode-runtime/components'
import { continueMcqsSession } from '@/features/mcqs-mode-runtime/actions/continueMcqsSession'
import { findMcqsSessionForDocument } from '@/features/mcqs-mode-runtime/actions/findMcqsSessionForDocument'
import { listDocumentSectionHeadings } from '@/features/mcqs-mode-runtime/presentation/listDocumentSectionHeadings'
import type { DocumentSectionHeading } from '@/features/mcqs-mode-runtime/presentation/listDocumentSectionHeadings'
import { listDocumentDefinitions } from '@/features/mcqs-mode-runtime/presentation/listDocumentDefinitions'
import type { DocumentDefinition } from '@/features/mcqs-mode-runtime/presentation/listDocumentDefinitions'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import type { ModeWorkspaceInitialState } from '@/features/learning-mode-runtime'

export const metadata: Metadata = {
  title: 'MCQs',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// MCQs™ Sprint ALS-17 — the real MCQs session route, structurally
// identical to every other stepped-session mode's own route. The one
// real difference: this route always loads the real ULO (once, the same
// real object every mode already loads — never a second parse) to
// compute `allHeadings`, since `StructureQuestionCard` needs the whole
// document's real section headings to build distractor options, not just
// the current chunk's own.
export default async function McqsDocumentPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/mcqs`)

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

  const ulo = await loadUniversalLearningObject(supabase, document.id)
  const allHeadings: readonly DocumentSectionHeading[] = ulo ? listDocumentSectionHeadings(ulo) : []
  const allDefinitions: readonly DocumentDefinition[] = ulo ? listDocumentDefinitions(ulo) : []
  const initial = await resolveInitialMcqsState(supabase, user.id, document.id, ulo !== null)

  return <McqsWorkspace documentId={document.id} documentTitle={document.title} allHeadings={allHeadings} allDefinitions={allDefinitions} initial={initial} projectId={project.id} />
}

async function resolveInitialMcqsState(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, documentId: string, uloExists: boolean): Promise<ModeWorkspaceInitialState> {
  const existingSnapshot = await findMcqsSessionForDocument(supabase, userId, documentId)

  if (existingSnapshot) {
    const result = await continueMcqsSession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return { kind: 'in-progress', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds, didResume: true }
  }

  return uloExists ? { kind: 'not-started' } : { kind: 'not-processed' }
}
