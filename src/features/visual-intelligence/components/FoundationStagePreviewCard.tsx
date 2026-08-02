import type { FoundationStage } from '../foundationStages'

type FoundationStagePreviewCardProps = {
  stage: FoundationStage
}

// Deliberately not a Link/button — only the Home screen's single "Start
// Journey" CTA advances anything. "Stage N of 5" is the only status shown:
// never "Completed"/"Locked"/a checkmark, since nothing is persisted yet
// and this app never fabricates progress that isn't real.
export function FoundationStagePreviewCard({ stage }: FoundationStagePreviewCardProps): React.JSX.Element {
  const Icon = stage.icon

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">{stage.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{stage.summary}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <span>Stage {stage.order} of 5</span>
        <span>{stage.estimatedDuration}</span>
      </div>
    </div>
  )
}
