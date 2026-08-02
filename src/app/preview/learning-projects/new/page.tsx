import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { NewLearningProjectWizard } from '@/components/learning/NewLearningProjectWizard'
import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from '@/lib/subscription/getIsPaidUser'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'
import { UpgradeToProBanner } from '@/features/quantum-document-transformer/components/UpgradeToProBanner'

export const metadata: Metadata = {
  title: 'New Learning Project',
}

// Sprint 1, Chunk 2 — New Learning Project™. Auth check matches the
// existing /preview/dashboard convention; the 3-step wizard itself is a
// Client Component (form state, drag & drop, upload progress).
//
// Freemium gate — this is now a real onboarding entry point (reachable
// straight from Choose Your Path™'s "Upload & Learn™" card), not just a
// dashboard-only action, so it needs the same proactive block the
// dashboard's AIDocumentTransformerWidget already shows: check the free
// tier limit here too, rather than only surfacing it after a wasted
// upload attempt hits the transform API's server-side enforcement.
export default async function NewLearningProjectPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/preview/learning-projects/new')

  const [isPro, documentCount] = await Promise.all([getIsPaidUser(user.id), getQuantumDocumentCount(user.id)])
  const isBlocked = !isPro && documentCount >= FREE_TIER_DOCUMENT_LIMIT

  if (isBlocked) {
    return (
      <div className="relative min-h-dvh overflow-hidden px-6 py-12">
        <div className="relative mx-auto max-w-2xl">
          <UpgradeToProBanner documentLimit={FREE_TIER_DOCUMENT_LIMIT} />
        </div>
      </div>
    )
  }

  return <NewLearningProjectWizard />
}
