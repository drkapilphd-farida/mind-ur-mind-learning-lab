import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { devGetReadingProgress } from '@/lib/exercises/actions/devProgressionTools'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { DevProgressionPanel } from '@/components/admin/DevProgressionPanel'
import { DevLegacyRecoveryPanel } from '@/components/admin/DevLegacyRecoveryPanel'

export const metadata: Metadata = { title: 'Dev Tools — Reading Progression' }

// Dev/Test Mode™ — never reachable in production, even by URL: this page
// 404s outright when NODE_ENV is production, on top of every action in
// devProgressionTools.ts independently refusing to run there too (defense
// in depth — the same "don't trust a single check" discipline the
// write-time authorization guard already established for savePracticeSession).
export default async function DevToolsPage(): Promise<React.JSX.Element> {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const progress = await devGetReadingProgress()

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dev Tools — Reading Progression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          QA/debugging only. Every action here operates on your own account through the real, unmodified
          progression engine — nothing is hardcoded or bypassed.
        </p>
      </div>

      <DevProgressionPanel
        sequence={READING_EXPANSION_MODULE.map((item) => ({ exerciseId: item.exerciseId, title: item.title }))}
        initialStatus={progress.success ? progress.statusByExerciseId : {}}
        initialAvailability={progress.success ? progress.availabilityByExerciseId : {}}
      />

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Legacy Document Recovery</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sprint PIPELINE-1 — platform-wide, not scoped to your own account.</p>
      </div>
      <DevLegacyRecoveryPanel />
    </div>
  )
}
