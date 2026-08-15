import type { Metadata } from 'next'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'
import { CompletionCertificate } from '@/features/quantum-journey/certificate/components/CompletionCertificate'
import { DownloadCertificateButton } from '@/features/quantum-journey/certificate/components/DownloadCertificateButton'
import { getDay21Session, computeCertificateStats } from '@/features/quantum-journey/certificate/certificateMath'
import { getBaselineDiagnostic } from '@/features/quantum-journey/baselineDiagnostic/queries/getBaselineDiagnostic'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Your Completion Certificate™ — 21-Day Quantum Reading & Mind Expansion',
  description: 'Your official 21-Day Quantum Speed Reading & Cognitive Mastery completion certificate.',
}

function formatCompletionDate(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// A readable, deterministic reference — never framed as something an
// external system can look up (this app has no such verification
// portal); it's a stable identifier tied to this real user and this real
// completion date, not a fabricated "scan to verify" claim.
function buildCertificateId(userId: string, completionIso: string): string {
  const datePart = completionIso.slice(0, 10).replace(/-/g, '')
  const userPart = userId.replace(/-/g, '').slice(0, 6).toUpperCase()
  return `MUM-${datePart}-${userPart}`
}

// Day 21 Completion Certificate™ — a dedicated, always-revisitable page
// (not just a one-time modal shown right after Day 21) so a user can
// return to view or re-print their certificate at any time. Every figure
// is computed fresh from real, already-persisted data on every visit —
// journey_baseline_diagnostics for the Day 1 baseline, daily_quantum_
// sessions for the real Day 21 result and the average comprehension
// across the whole journey (see certificateMath.ts's own comments on
// exactly how each number is derived). No certificate renders until Day
// 21 has genuinely been completed — an honest gate, never a fabricated
// preview.
export default async function JourneyCertificatePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [baselineDiagnostic, history, profile] = await Promise.all([
    getBaselineDiagnostic(),
    getDailyQuantumSessionHistory(),
    user ? getCurrentUserProfile(user.id) : Promise.resolve(null),
  ])

  const day21Session = getDay21Session(history)
  const studentName = profile?.fullName ?? 'there'

  return (
    <div>
      <LabNavHeader currentSection="Certificate" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <LabPageHeader
          eyebrow="21-Day Quantum Reading & Mind Expansion™"
          title="Your Completion Certificate™"
          subtitle="A real, printable record of your Day 1 to Day 21 growth."
        />

        <div className="mt-8">
          {day21Session === null || baselineDiagnostic === null || !user ? (
            <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Certificate Locked</p>
              <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">Complete Day 21 to Unlock Your Certificate</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your certificate is generated the moment you genuinely finish all 21 real days of the journey — nothing is ever shown early.
              </p>
            </div>
          ) : (
            (() => {
              const stats = computeCertificateStats(baselineDiagnostic.trueBaselineWpm, day21Session, history)
              const certificateId = buildCertificateId(user.id, stats.completionDate)
              return (
                <div className="flex flex-col items-center gap-6">
                  <CompletionCertificate
                    studentName={studentName}
                    completionDateLabel={formatCompletionDate(stats.completionDate)}
                    startingWpm={stats.startingWpm}
                    endingWpm={stats.endingWpm}
                    growthPercent={stats.growthPercent}
                    averageComprehensionPercent={stats.averageComprehensionPercent}
                    certificateId={certificateId}
                  />
                  <DownloadCertificateButton />
                </div>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}
