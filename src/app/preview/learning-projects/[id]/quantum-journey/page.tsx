import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FileQuestion } from 'lucide-react'
import { listDocuments } from '@/api/documents'
import { getLearningProject } from '@/api/learning'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { QuantumReadingJourneyExperience } from '@/features/learning-mode-runtime/quantum-reading-journey/QuantumReadingJourneyExperience'
import { ReadingAssessmentFlow } from '@/features/quantum-speed-reading-runtime/components'
import { loadUniversalLearningObject } from '@/features/quantum-speed-reading-runtime/persistence/loadUniversalLearningObject'
import { listDocumentComprehensionSignals } from '@/features/quantum-speed-reading-runtime/presentation/listDocumentComprehensionSignals'
import { checkReadingAssessmentExists } from '@/features/quantum-speed-reading-runtime/assessment/actions/checkReadingAssessmentExists'
import { selectAssessmentPassages } from '@/features/quantum-speed-reading-runtime/assessment/selectAssessmentPassages'

export const metadata: Metadata = {
  title: 'Quantum Reading Journey',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. Same auth + ownership + document-lookup pattern as every
// other `/preview/learning-projects/*` route (mirrors `[id]/read/page.tsx`
// exactly). Chapter/Exercise Asset readiness is checked one layer down,
// inside loadQuantumJourneyChapter (an honest "no real Learning Assets
// yet" error surfaces there, not here) — this page only resolves which
// real document to open the journey for.
//
// QSR-INTEGRATION-1 — "Reading Assessment (if first time)" gate, copied
// verbatim from `[id]/read/page.tsx`'s own real, already-working pattern:
// `checkReadingAssessmentExists` + `selectAssessmentPassages(ulo)`, and
// on completion `ReadingAssessmentFlow` itself calls `router.refresh()`,
// which re-runs this same server check and falls through to the real
// Journey below — no new assessment system, no client state to manage
// here. A check failure or a document with no suitable passages both
// fail open (skip straight to the Journey) — the assessment is a
// nice-to-have measurement step, never a blocker on reading itself, the
// same principle `/read/page.tsx`'s own gate already uses.
export default async function QuantumReadingJourneyPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/preview/learning-projects/${id}/quantum-journey`)

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
  if (ulo) {
    const assessmentCheck = await checkReadingAssessmentExists({ documentId: document.id })
    if (assessmentCheck.success && !assessmentCheck.exists) {
      const passages = selectAssessmentPassages(ulo)
      if (passages.length > 0) {
        const comprehensionSignals = listDocumentComprehensionSignals(ulo)
        return <ReadingAssessmentFlow documentId={document.id} documentTitle={document.title} passages={passages} comprehensionSignals={comprehensionSignals} />
      }
    }
  }

  return <QuantumReadingJourneyExperience documentId={document.id} projectId={project.id} />
}
