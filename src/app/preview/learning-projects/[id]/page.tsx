import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, FileQuestion, Sparkles } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { LearningBlueprintExperience } from '@/components/learning/LearningBlueprintExperience'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { UPLOAD_LEARNING_GOALS, type UploadLearningGoalId } from '@/constants/learning/uploadLearningGoals'
import { generateRealLearningBlueprint } from '@/lib/blueprint/generateRealLearningBlueprint'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Learning Project',
}

// ALS-15 Instant Learning Engine™ — a defensive ceiling for
// `pollBackgroundProcessing`, whose real Claude calls (one enrichment
// batch, the knowledge graph step, or the learning analysis step) can
// take up to ~30-35s in the worst case. A `'use server'` file cannot
// export its own `maxDuration`, so this route segment (the one page that
// mounts the poll hook) is where it lives.
export const maxDuration = 45

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ goal?: string }>
}

// AI Learning Studio™ V1 Launch UX Transformation — `?goal=` is an
// unvalidated query param; only a real, known UploadLearningGoalId is
// ever honored, anything else is treated the same as absent.
function parseGoalParam(goal: string | undefined): UploadLearningGoalId | null {
  return UPLOAD_LEARNING_GOALS.some((definition) => definition.id === goal) ? (goal as UploadLearningGoalId) : null
}

// Sprint 1, Chunk 4 — the Project Detail page. Auth + ownership check
// matches every other /preview/learning-projects route. What renders
// depends entirely on the project's one Document's real status:
// 'processing' sends the user back to the processing experience,
// 'failed' shows a genuine error state, 'ready' shows the full Learning
// Blueprint™.
//
// Production AI Integration — the Blueprint is now built entirely from
// the real, Claude-enriched Universal Learning Object™
// (generateRealLearningBlueprint.ts), not the old deterministic mock
// generator. Loads the ULO via the exact same shared
// `loadUniversalLearningObject` every other real Learning Mode route
// already calls — zero duplicate Claude calls, the same real, once-
// enriched object reused everywhere. A 'ready' document with no ULO yet
// (image/camera-scan/legacy `.doc` — a real, disclosed ALS-10 gap) gets
// the same honest "not processed yet" empty state every other real
// Learning Mode page already uses, instead of the old mock content.
export default async function LearningProjectDetailPage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const { goal } = await searchParams
  const goalId = parseGoalParam(goal)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}`)

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

  const ulo = await loadUniversalLearningObject(supabase, document.id)
  if (!ulo) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyStateCard
          icon={Sparkles}
          title="This document hasn't been prepared yet"
          description="Its Universal Learning Object™ hasn't been built yet — check back once processing finishes."
        />
      </div>
    )
  }

  const blueprint = generateRealLearningBlueprint(document, ulo)

  return (
    <LearningBlueprintExperience
      project={project}
      documentId={document.id}
      documentStatus={document.status}
      documentTitle={document.title}
      documentMimeType={document.mimeType}
      documentSizeBytes={document.sizeBytes}
      blueprint={blueprint}
      goalId={goalId}
    />
  )
}
