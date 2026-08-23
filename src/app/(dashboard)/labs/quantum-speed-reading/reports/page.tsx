import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LabPageHeader } from '@/features/quantum-speed-reading/components/shell/LabPageHeader'

export const metadata: Metadata = {
  title: 'Reading Reports — Reading Intelligence Lab™',
}

const REPORT_LINKS = [
  {
    href: '/labs/quantum-speed-reading/reports/session',
    title: 'Session Report',
    description: 'Speed, comprehension, accuracy, and coaching for your most recent session.',
  },
  {
    href: '/labs/quantum-speed-reading/reports/weekly',
    title: 'Weekly Report',
    description: 'This week vs. last week — real aggregate comparison.',
  },
  {
    href: '/labs/quantum-speed-reading/reports/monthly',
    title: 'Monthly Report',
    description: 'This month vs. last month — real aggregate comparison.',
  },
  {
    href: '/labs/quantum-speed-reading/reports/intelligence',
    title: 'Reading Intelligence Report™',
    description: 'The full picture: Reading DNA™, goals, achievements, and complete session history.',
  },
] as const

// Sprint-6, Part 4 — Reports hub. Every report reuses existing Sprint-4/5
// engines (plus the new monthlyInsightEngine.ts); print/PDF export is
// browser-native (@media print + window.print(), see PrintButton.tsx).
export default function ReadingReportsPage(): React.JSX.Element {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <LabPageHeader
          eyebrow="Reading Reports"
          title="Your Reports"
          subtitle="See how your reading brain has grown, built entirely from your real training history."
        />

        <div className="mt-10 space-y-3">
          {REPORT_LINKS.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="text-base font-semibold text-foreground">{report.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
