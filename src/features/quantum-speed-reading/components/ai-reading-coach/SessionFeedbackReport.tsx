import { cn } from '@/lib/utils'
import type { SessionFeedbackReport as SessionFeedbackReportData } from '../../ai-reading-coach/sessionFeedbackEngine'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type SessionFeedbackReportProps = {
  report: SessionFeedbackReportData
}

const VERDICT_CLASS: Record<SessionFeedbackReportData['overallPerformance']['verdict'], string> = {
  excellent: 'text-success',
  good: 'text-foreground',
  'needs-practice': 'text-muted-foreground',
}

function ReportRow({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="border-t border-border/50 py-4 first:border-t-0 first:pt-0">
      <p className={LAB_STAT_LABEL_CLASS}>{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  )
}

export function SessionFeedbackReport({ report }: SessionFeedbackReportProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Overall Performance</p>
      <h2 className={cn('mt-1 font-heading text-2xl font-bold tracking-tight', VERDICT_CLASS[report.overallPerformance.verdict])}>
        {report.overallPerformance.label}
      </h2>

      <div className="mt-3">
        <ReportRow label="Reading Speed">{report.speedFeedback}</ReportRow>
        <ReportRow label="Comprehension">{report.comprehensionFeedback}</ReportRow>
        <ReportRow label="Accuracy">{report.accuracyFeedback}</ReportRow>
        <ReportRow label="Reading Balance">{report.readingBalance.message}</ReportRow>
      </div>

      <div className="mt-4 rounded-xl bg-muted/40 p-4">
        <p className={LAB_STAT_LABEL_CLASS}>Session Summary</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{report.summary}</p>
      </div>
    </div>
  )
}
