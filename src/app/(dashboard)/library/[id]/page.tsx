import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, FileWarning } from 'lucide-react'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { getQuantumDocumentById } from '@/features/quantum-document-transformer/actions/getQuantumDocumentById'
import { getQuantumDocumentOutcomeProfile } from '@/features/quantum-document-transformer/actions/getQuantumDocumentOutcomeProfile'
import { getLanguageName } from '@/features/quantum-document-transformer/supportedLanguages'
import { QuantumDocumentDetailView } from '@/features/quantum-document-transformer/components/QuantumDocumentDetailView'

export const metadata: Metadata = {
  title: 'Document',
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Branding Header™ — the same brand-logo-wrap/brand-gradient-text
// technique AppSidebar.tsx already established for the persistent
// wordmark, reused here without a `missedDays` prop (this page has no
// streak data of its own) — the CSS's own fallback values
// (`var(--missed-intensity, 0)`, `var(--logo-glow-a, #2b4ce8aa)`, etc.)
// mean the breathing glow still renders correctly with zero extra CSS.
function DocumentDetailHeader(): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-2">
        <span className="brand-logo-wrap">
          <LivingBrainLogo size={22} decorative={false} animated={false} />
          <span className="brand-logo-warmth" aria-hidden="true" />
        </span>
        <span className="brand-gradient-text text-sm font-bold tracking-tight">Quantum Mind</span>
      </div>
    </div>
  )
}

// Isolated Document View™ — the dedicated page a document's full AI
// output now lives on (Summary, Spider Notes, Reading Text, Feynman
// Challenge, Smart Mnemonics, Subject Lens, Keywords, Document Outcome
// Profile™, Quantum Session), reached from AIDocumentTransformerWidget
// after a fresh transform, from the dashboard's Recent Documents
// quick-access list, or from Document History™. Keeps the main dashboard
// feed to quick-access cards only — see dashboard/page.tsx.
export default async function DocumentDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params
  const result = await getQuantumDocumentById(id)
  // Fetched unconditionally (not just on success) — a cheap, harmless
  // empty-profile read when the document itself failed to load; keeping
  // this one Promise.all-free avoids blocking the document fetch on a
  // second round trip that's only ever used in the success branch below.
  const outcomeProfile = await getQuantumDocumentOutcomeProfile(id)

  return (
    <div className="glass-premium relative -m-6 space-y-4 p-6 sm:-m-8 sm:space-y-6 sm:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glass-ambient-blob" style={{ width: 520, height: 520, top: -140, left: -100, background: 'var(--ambient-a)' }} />
        <div className="glass-ambient-blob" style={{ width: 460, height: 460, top: 220, right: -140, background: 'var(--ambient-b)' }} />
        <div className="glass-ambient-blob" style={{ width: 380, height: 380, bottom: -160, left: '35%', background: 'var(--ambient-a)' }} />
      </div>

      <DocumentDetailHeader />

      {result.success ? (
        <>
          <div>
            <h1 className={TYPOGRAPHY.h1}>{result.document.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {getLanguageName(result.document.targetLanguage)} · {new Date(result.document.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <QuantumDocumentDetailView document={result.document} initialOutcomeProfile={outcomeProfile} />
        </>
      ) : (
        <div className="glass-premium-card flex flex-col items-center gap-3 p-8 text-center">
          <FileWarning className="size-8 text-muted-foreground/60" aria-hidden="true" />
          <p className={TYPOGRAPHY.h3}>{result.error}</p>
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}
