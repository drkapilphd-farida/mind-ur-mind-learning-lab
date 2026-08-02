import type { VisualAnalytics } from './visualAnalytics'

const ANALYTICS_LABELS: Record<keyof VisualAnalytics, string> = {
  fixationStability: 'Fixation Stability™',
  afterImageAwareness: 'After-Image Awareness™',
  observationQuality: 'Observation Quality™',
  visualEndurance: 'Visual Endurance™',
  sessionConfidence: 'Session Confidence™',
}

type VisualAnalyticsSummaryProps = {
  analytics: VisualAnalytics
}

// Generic, mission-agnostic — reused by any future image-fixation mission's
// completion screens unchanged.
export function VisualAnalyticsSummary({ analytics }: VisualAnalyticsSummaryProps): React.JSX.Element {
  return (
    <div className="w-full rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Analytics Summary</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(Object.keys(ANALYTICS_LABELS) as (keyof VisualAnalytics)[]).map((key) => (
          <div key={key} className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-base font-semibold text-foreground">{analytics[key]}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{ANALYTICS_LABELS[key]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
