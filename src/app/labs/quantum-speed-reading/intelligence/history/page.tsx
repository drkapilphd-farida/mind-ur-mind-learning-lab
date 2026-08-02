import type { Metadata } from 'next'
import { getReadingIntelligenceSessions } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { ReadingHistoryTable } from '@/features/quantum-speed-reading/components/adaptive-intelligence/ReadingHistoryTable'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'

export const metadata: Metadata = {
  title: 'Reading History — Quantum Speed Reading™',
}

// getReadingIntelligenceSessions already orders newest-first.
export default async function ReadingHistoryPage(): Promise<React.JSX.Element> {
  const sessions = await getReadingIntelligenceSessions()

  return (
    <div>
      <LabNavHeader currentSection="History" />
      <div className="mx-auto max-w-2xl px-6 py-16">
      <LabPageHeader
        eyebrow="Adaptive Intelligence Engine™"
        title="Reading History"
        subtitle="Every completed reading session, newest first."
      />

      <p className="mt-6 text-sm text-muted-foreground">
        Watch your WPM and comprehension together — rising numbers on both mean your training is paying off.
      </p>

      <div className="mt-4">
        <ReadingHistoryTable sessions={sessions} />
      </div>
      </div>
    </div>
  )
}
