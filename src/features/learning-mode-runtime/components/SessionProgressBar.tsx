import { Progress } from '@/components/ui/progress'
import { formatEstimatedTimeRemaining } from '../presentation/formatSessionDuration'

type SessionProgressBarProps = {
  completionPercentage: number
  completedChunks: number
  totalChunks: number
  estimatedTimeLeftSeconds: number
}

// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own
// `components/SessionProgressBar.tsx` (Sprint-2/3) — already fully
// mode-agnostic, name included. `completionPercentage`/`completedChunks`
// reuse LSE-2's and LSE-3's own real fields directly; `estimatedTimeLeftSeconds`
// reuses LSE-2's own real `RuntimeProgress.estimatedTimeLeftSeconds`,
// formatted, never recomputed. `aria-valuetext` gives the progress bar a
// real, complete spoken description beyond the bare percentage Radix's
// own `Progress` primitive already announces. This is the Memory Mode™
// Sprint-2 "Progress Indicator" — the same component, not a second one.
export function SessionProgressBar({ completionPercentage, completedChunks, totalChunks, estimatedTimeLeftSeconds }: SessionProgressBarProps): React.JSX.Element {
  const percentage = Math.round(completionPercentage * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completedChunks} of {totalChunks} chunks
        </span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} aria-label="Session progress" aria-valuetext={`${percentage}% complete, ${completedChunks} of ${totalChunks} chunks`} />
      {completionPercentage < 1 && <p className="text-xs text-muted-foreground">{formatEstimatedTimeRemaining(estimatedTimeLeftSeconds)}</p>}
    </div>
  )
}
