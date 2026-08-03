import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'

type CompletionCertificateProps = {
  studentName: string
  completionDateLabel: string
  startingWpm: number
  endingWpm: number
  growthPercent: number | null
  averageComprehensionPercent: number
  certificateId: string
}

// Day 21 Completion Certificate™ — a real, printable document (see
// PrintButton.tsx's own established "window.print() is our PDF export"
// convention, reused verbatim by the page that renders this). Marked
// with `data-report-section` so the existing global `@media print` rule
// in globals.css (box-shadow removed, no page-break through the middle)
// applies automatically, exactly like every other exportable report in
// this app.
export function CompletionCertificate({
  studentName,
  completionDateLabel,
  startingWpm,
  endingWpm,
  growthPercent,
  averageComprehensionPercent,
  certificateId,
}: CompletionCertificateProps): React.JSX.Element {
  return (
    <div
      data-report-section
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border-4 border-double border-amber-500/40 bg-gradient-to-br from-card via-card to-amber-500/5 p-10 shadow-lg sm:p-14"
    >
      {/* Decorative corner flourishes */}
      <div className="absolute top-0 left-0 size-24 rounded-br-full bg-gradient-to-br from-indigo-500/10 to-transparent" aria-hidden="true" />
      <div className="absolute right-0 bottom-0 size-24 rounded-tl-full bg-gradient-to-tl from-teal-500/10 to-transparent" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <LivingBrainLogo size={56} animated={false} />

        <div>
          <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">Certificate of Completion</p>
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            21-Day Quantum Speed Reading
            <br />& Cognitive Mastery
          </h1>
        </div>

        <p className="text-sm text-muted-foreground">This certifies that</p>
        <p className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{studentName}</p>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          has successfully completed all 21 real days of the Transformation Journey™, demonstrating measurable, real growth in reading speed
          and comprehension.
        </p>

        <div className="grid w-full grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Starting WPM</p>
            <p className="font-heading text-xl font-bold tabular-nums text-foreground">{startingWpm}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Final WPM</p>
            <p className="font-heading text-xl font-bold tabular-nums text-foreground">{endingWpm}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Growth</p>
            <p className="font-heading text-xl font-bold tabular-nums text-foreground">
              {growthPercent !== null ? `${growthPercent >= 0 ? '+' : ''}${growthPercent}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Avg. Comprehension</p>
            <p className="font-heading text-xl font-bold tabular-nums text-foreground">{averageComprehensionPercent}%</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-between border-t border-border/60 pt-6">
          <div className="text-left">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Date of Completion</p>
            <p className="text-sm font-semibold text-foreground">{completionDateLabel}</p>
          </div>

          {/* Official verification badge — a hand-crafted seal, not a
              claim of an external lookup system that doesn't exist. */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-amber-500/50 bg-amber-500/10">
              <svg viewBox="0 0 24 24" className="size-8 text-amber-600 dark:text-amber-400" fill="none" aria-hidden="true">
                <path
                  d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.3 7.2 16.9l.9-5.4-3.9-3.8 5.4-.8L12 2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">Verified Completion</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Certificate ID</p>
            <p className="text-sm font-semibold tabular-nums text-foreground">{certificateId}</p>
          </div>
        </div>

        <p className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">Quantum Mind Learning Lab™</p>
      </div>
    </div>
  )
}
