import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getLearningProject } from '@/api/learning'
import { listDocuments } from '@/api/documents'
import { ProcessingExperience } from '@/components/learning/ProcessingExperience'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Your AI Learning Mentor Is Thinking',
}

// ALS-15 Instant Learning Engine™ — a defensive ceiling for
// `runPhase1QuickIntelligence`, which makes zero AI calls and should
// comfortably finish well under this. A `'use server'` file cannot
// export its own `maxDuration`, so this route segment is where it lives.
export const maxDuration = 45

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ goal?: string }>
}

// Sprint 1, Chunk 3 — AI Processing Experience™. Auth + ownership check
// matches the existing /preview/dashboard and
// /preview/learning-projects/new conventions; the animated pipeline
// itself lives in the Client Component. Chunk 4 addition: a Document
// that has already finished (or already failed) sends the user straight
// to the Project Detail page instead of replaying the animation —
// visiting this URL a second time should never re-run processing.
//
// AI Learning Studio™ V1 Launch UX Transformation — `?goal=` is the
// learner's own Screen 4 selection, threaded through as a plain query
// param (no schema/business-logic change) so the Learning Mission screen
// can honor it. Passed straight through here unread/unvalidated; the
// Blueprint page is the one place that interprets it.
export default async function LearningProjectProcessingPage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const { goal } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/processing`)

  const project = await getLearningProject(user.id, id)
  if (!project) notFound()

  const documents = await listDocuments(user.id, id)
  const document = documents[0]
  if (!document) notFound()

  if (document.status !== 'processing') {
    redirect(`/preview/learning-projects/${id}${goal ? `?goal=${goal}` : ''}`)
  }

  return <ProcessingExperience projectId={project.id} projectTitle={project.title} documentId={document.id} documentTitle={document.title} goal={goal ?? null} />
}
