import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type ReadingInsightCalloutProps = {
  emoji: string
  text: string
}

// Restored (AI Learning Studio™ Sprint ALS-8) after being accidentally
// removed along with the deleted mock `ReadingExperienceShell.tsx` — this
// component is still real, load-bearing production code for the separate
// legacy Quantum Speed Reading™ experience
// (features/quantum-speed-reading/components/reading-experience/ReadingExperience.tsx),
// which is out of AI Learning Studio's scope and was never meant to be
// touched. A small, transient insight callout shown during an active
// reading session; purely presentational, positioning handled entirely by
// the caller.
export function ReadingInsightCallout({ emoji, text }: ReadingInsightCalloutProps): React.JSX.Element {
  return (
    <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 shadow-sm backdrop-blur-sm">
      <span aria-hidden="true">{emoji}</span>
      <span className={cn(TYPOGRAPHY.caption, 'text-foreground')}>{text}</span>
    </div>
  )
}
