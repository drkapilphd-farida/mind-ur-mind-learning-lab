import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { ModeChoiceExperience } from '@/components/learning/ModeChoiceExperience'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Choose Your Study Mode',
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ goal?: string }>
}

// Mode A / Mode B Fork™ (Phase 2) — same auth + ownership + document
// pattern as every sibling `/preview/learning-projects/[id]/*` route.
// Reached exactly once per project, right after processing finishes (see
// processing/page.tsx and ProcessingExperience.tsx's own redirect
// target) — but this page re-checks document status independently
// anyway, the same "never assume an upstream redirect holds" discipline
// the hub page (`[id]/page.tsx`) already follows, since a bookmarked or
// back-navigated visit could land here before processing genuinely
// finished. `?goal=` is carried through unread, straight into Mode B's
// own href, exactly as `[id]/page.tsx` already threads it — this page
// never interprets it itself.
export default async function ModeChoicePage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const { goal } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/mode-choice`)

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
              <Link href="/preview/dashboard">Back to Dashboard</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (document.status === 'processing') {
    redirect(`/preview/learning-projects/${id}/processing`)
  }

  if (document.status === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyStateCard
          icon={AlertTriangle}
          title="This document couldn't be processed"
          description="Something went wrong while preparing this Learning Project. Try uploading the document again to start a new one."
          action={
            <Button asChild>
              <Link href="/preview/learning-projects/new">Start a New Learning Project</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const goalSuffix = goal ? `?goal=${goal}` : ''

  return (
    <ModeChoiceExperience
      projectId={project.id}
      projectTitle={project.title}
      documentTitle={document.title}
      modeAHref={`/preview/learning-projects/${id}/read?qsrMode=intelligent-reading`}
      modeBHref={`/preview/learning-projects/${id}${goalSuffix}`}
    />
  )
}
