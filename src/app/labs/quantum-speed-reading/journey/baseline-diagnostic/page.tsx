import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { BaselineDiagnosticExperience } from '@/features/quantum-journey/baselineDiagnostic/components/BaselineDiagnosticExperience'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'

export const metadata: Metadata = {
  title: 'Baseline Reading Speed Diagnostic™ — 21-Day Quantum Reading & Mind Expansion',
  description: 'A mandatory, one-time reading speed and comprehension check before Day 1.',
}

// Baseline Reading Speed Diagnostic™ — exactly one real attempt per user,
// ever (journey_baseline_diagnostics has a UNIQUE constraint on user_id).
// Someone who already has a locked-in baseline (including a returning
// user re-visiting this URL directly) is sent straight to Day 1 rather
// than being allowed to retake it — see BaselineDiagnosticExperience's
// own comment on why this figure is permanent, not something a second
// attempt can overwrite.
export default async function BaselineDiagnosticPage(): Promise<React.JSX.Element> {
  const existingDiagnostic = await getBaselineDiagnostic()
  if (existingDiagnostic !== null) {
    redirect('/labs/quantum-speed-reading/journey/1')
  }

  return <BaselineDiagnosticExperience />
}
