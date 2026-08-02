import { LAB_EYEBROW_CLASS, LAB_TITLE_CLASS } from '../shell/LabPageHeader'
import { PrintButton } from './PrintButton'

type ReportHeaderProps = {
  eyebrow: string
  title: string
  generatedAtLabel: string
}

// Sprint-6, Part 4 — shared report masthead: title + generation timestamp
// (so a printed/exported report is self-describing) + the print button.
export function ReportHeader({ eyebrow, title, generatedAtLabel }: ReportHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
      <div>
        <p className={LAB_EYEBROW_CLASS}>{eyebrow}</p>
        <h1 className={LAB_TITLE_CLASS}>{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Generated {generatedAtLabel}</p>
      </div>
      <PrintButton />
    </div>
  )
}
