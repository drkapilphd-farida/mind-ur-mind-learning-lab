import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { LEARNING_MODES } from '@/constants/learning/learningModes'
import type { LearningModeId } from '@/constants/learning/learningModes'
import { LearningWorkspaceShell, resolveLearningWorkspaceState } from '@/features/ai-learning-studio'
import { analyzeDocumentContent } from '@/lib/processing/analyzeDocumentContent'
import { createClient } from '@/lib/supabase/server'
import { isWorkspaceAccessible } from '@/types/documents'

export const metadata: Metadata = {
  title: 'Learning Workspace',
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}

const REAL_MODE_ROUTE_SEGMENT: Partial<Record<LearningModeId, string>> = {
  'quantum-speed-reading': 'read',
  'memory-mode': 'memory',
  'smart-notes': 'notes',
  // AI Learning Studio™ Sprint ALS-13 — real, generate-once-and-cache
  // Learning Modes (no stepped session, unlike the three above).
  'mind-map': 'mind-map',
  flashcards: 'flashcards',
  // AI Learning Studio™ Sprint ALS-16 — Focus Mode™ (Mini), a real
  // stepped session like the first three modes above.
  'focus-mode': 'focus',
  // AI Learning Studio™ Sprint ALS-17 — MCQs™ and Revision Mode™, both
  // real stepped sessions like every mode above (never generate-once-and-
  // cache like Mind Map™/Flashcards™).
  mcqs: 'mcqs',
  'revision-mode': 'revision',
  // Production AI Integration — ALS-24 — Research Mode™, a real stepped
  // session like every mode above.
  'research-mode': 'research',
}

// AI Learning Studio™ Sprint ALS-5 — the universal Learning Workspace™
// route: same auth + ownership + document-status pattern as every other
// `/preview/learning-projects/*` route, but mode-agnostic — `?mode=`
// selects which real (or not-yet-real) Learning Mode to show. Reuses the
// exact real find/continue session functions each mode's own dedicated
// route already calls (see resolveLearningWorkspaceState) — this route
// never re-implements or duplicates that logic, only orchestrates a
// generic container around it. Ends exactly at this container — no
// mode-specific content (reading passage, memory card, notes editor)
// renders here; `continueHref` hands off to the mode's own real route
// when one exists.
export default async function LearningWorkspacePage({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const { mode: modeParam } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/workspace${modeParam ? `?mode=${encodeURIComponent(modeParam)}` : ''}`)

  const mode = LEARNING_MODES.find((candidate) => candidate.id === modeParam)
  if (!mode) notFound()

  const project = await getLearningProject(user.id, id)
  if (!project) notFound()

  const documents = await listDocuments(user.id, id)
  const document = documents[0]
  if (!document) notFound()

  // ALS-15 Instant Learning Engine™ — every Learning Mode routes through
  // this one choke point (resolveLearningModeHref → /workspace?mode=X).
  // A document at 'workspace_ready' is fully usable (Phase 1 finished);
  // it does not need to wait for Phase 3 "Background AI Intelligence" to
  // also finish, since none of these modes have any real AI dependency
  // this gate needs to enforce (Flashcards/Mind Map/MCQs already degrade
  // gracefully to structural content until their own real data lands).
  if (!isWorkspaceAccessible(document.status)) {
    redirect(`/preview/learning-projects/${id}`)
  }

  const state = await resolveLearningWorkspaceState(supabase, user.id, document.id, mode.id)
  const contentTypeLabel = analyzeDocumentContent({ mimeType: document.mimeType, sizeBytes: document.sizeBytes }).formatLabel
  const realRouteSegment = REAL_MODE_ROUTE_SEGMENT[mode.id]
  const continueHref = realRouteSegment ? `/preview/learning-projects/${id}/${realRouteSegment}` : null

  return (
    <LearningWorkspaceShell
      projectTitle={project.title}
      documentTitle={document.title}
      contentTypeLabel={contentTypeLabel}
      mode={mode}
      state={state}
      continueHref={continueHref}
      backHref={`/preview/learning-projects/${id}`}
    />
  )
}
