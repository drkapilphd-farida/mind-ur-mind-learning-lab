import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { ReadingWorkspace, ReadingAssessmentFlow } from '@/features/quantum-speed-reading-runtime/components'
import { continueReadingSession } from '@/features/quantum-speed-reading-runtime/actions/continueReadingSession'
import { findReadingSessionForDocument } from '@/features/quantum-speed-reading-runtime/actions/findReadingSessionForDocument'
import { loadUniversalLearningObject } from '@/features/quantum-speed-reading-runtime/persistence/loadUniversalLearningObject'
import { listDocumentComprehensionSignals } from '@/features/quantum-speed-reading-runtime/presentation/listDocumentComprehensionSignals'
import type { DocumentComprehensionSignal } from '@/features/quantum-speed-reading-runtime/presentation/listDocumentComprehensionSignals'
import { checkReadingAssessmentExists } from '@/features/quantum-speed-reading-runtime/assessment/actions/checkReadingAssessmentExists'
import { selectAssessmentPassages } from '@/features/quantum-speed-reading-runtime/assessment/selectAssessmentPassages'
import type { QsrModeId } from '@/features/quantum-speed-reading-runtime/presentation/recommendQsrMode'
import type { ReadingWorkspaceInitialState } from '@/features/quantum-speed-reading-runtime/types'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

export const metadata: Metadata = {
  title: 'Quantum Speed Reading',
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ qsrMode?: string }>
}

const VALID_QSR_MODE_IDS: readonly QsrModeId[] = [
  'sequential',
  'presence',
  'smart-chunk',
  'guided-eye-flow',
  'sprint',
  'comprehension-check',
  'speed-ladder',
  'intelligent-reading',
]

// Mode A / Mode B Fork™ (Phase 2) — `?qsrMode=` is an unvalidated query
// param (the mode-choice screen's own Mode A link sets it to
// 'intelligent-reading'); only a real, known QsrModeId is ever honored,
// anything else falls through to ReadingWorkspace's own real default —
// the same "never trust a raw client value unchecked" discipline
// `[id]/page.tsx`'s own `?goal=` parsing already follows.
function parseQsrModeParam(qsrMode: string | undefined): QsrModeId | undefined {
  return VALID_QSR_MODE_IDS.find((candidate) => candidate === qsrMode)
}

// Quantum Speed Reading™ Production Sprint-2 — the real reading route.
// Originally built deliberately separate from a Sprint-0 mock preview at
// `/preview/learning-studio/quantum-speed-reading`
// (`generateLearningBlueprint`/`generateReadingPassage` — synthetic
// template prose, never the real Universal Learning Object™ or the real
// runtime); that mock route and its supporting components were removed
// in AI Learning Studio™ Sprint ALS-8 once every real Learning Mode
// routed through the universal Learning Workspace™ instead. This route
// is unaffected — same disclosed-not-silent pattern this arc has used
// for the legacy `/labs/quantum-speed-reading/*` system since Sprint-1.
//
// Same auth + ownership pattern as every other `/preview/learning-
// projects/*` route. What renders depends entirely on real, checked
// state: an existing real session (Session Recovery, via
// `continueReadingSession` — the real restore, not a guess), a real ULO
// with no session yet, or a real "not processed yet" gap (nothing in
// this app currently triggers UCE processing + ULO persistence
// automatically — see docs/PRODUCTION_HANDOFF_QSR_SPRINT_2.md).
export default async function ReadDocumentPage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const { qsrMode } = await searchParams
  const initialQsrMode = parseQsrModeParam(qsrMode)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/read`)

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

  // Quantum Speed Reading Experience Engine™ (QSR-E1) — Comprehension
  // Check™'s real, whole-document enrichment pool, computed once here
  // (the same real ULO `resolveInitialReadingState` already needs to
  // check) and passed down as a plain prop — the ULO itself never
  // reaches the client, the same boundary MCQs mode's own equivalent
  // pooled data already respects.
  const ulo = await loadUniversalLearningObject(supabase, document.id)
  const comprehensionSignals: readonly DocumentComprehensionSignal[] = ulo ? listDocumentComprehensionSignals(ulo) : []

  // Reading Assessment Engine™ (Production Prompt 01A) — a page-level
  // gate, local to this route only: zero changes to
  // `ReadingWorkspaceInitialState`/`resolveInitialReadingState` below, or
  // to any other Learning Mode's own state machine. Runs once, the first
  // time a learner opens QSR for a document with no Reading Profile yet.
  // A check failure or a document with no suitable real passages both
  // fail open (render the normal Reading Workspace) — the assessment is
  // a nice-to-have measurement step, never a blocker on the core reading
  // feature, the same principle Comprehension Check's own empty state
  // already uses.
  if (ulo) {
    const assessmentCheck = await checkReadingAssessmentExists({ documentId: document.id })
    if (assessmentCheck.success && !assessmentCheck.exists) {
      const passages = selectAssessmentPassages(ulo)
      if (passages.length > 0) {
        return <ReadingAssessmentFlow documentId={document.id} documentTitle={document.title} passages={passages} comprehensionSignals={comprehensionSignals} />
      }
    }
  }

  const initial = await resolveInitialReadingState(supabase, user.id, document.id, ulo)

  return (
    <ReadingWorkspace
      documentId={document.id}
      documentTitle={document.title}
      chunkStrategy="sequential"
      initial={initial}
      projectId={project.id}
      comprehensionSignals={comprehensionSignals}
      {...(initialQsrMode !== undefined ? { initialQsrMode } : {})}
    />
  )
}

async function resolveInitialReadingState(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  documentId: string,
  ulo: UniversalLearningObject | null,
): Promise<ReadingWorkspaceInitialState> {
  const existingSnapshot = await findReadingSessionForDocument(supabase, userId, documentId)

  if (existingSnapshot) {
    const result = await continueReadingSession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return { kind: 'in-progress', snapshot: result.snapshot, currentChunk: result.currentChunk, queueIndex: result.queueIndex, totalChunks: result.totalChunks, estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds, didResume: true }
  }

  return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
}
