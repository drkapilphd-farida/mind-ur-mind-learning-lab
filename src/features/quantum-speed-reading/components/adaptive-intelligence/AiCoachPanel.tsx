import { GoalProgressBar } from './GoalProgressBar'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

export type ReadingDnaUpdate = {
  label: string
  previousConfidence: number
  currentConfidence: number
}

export type GoalProgressSummary = {
  goalTitle: string
  percent: number
}

type AiCoachPanelProps = {
  todaysInsight: string
  coachRecommendation: string
  todaysFocus: string
  dnaUpdate: ReadingDnaUpdate | null
  goalProgress: GoalProgressSummary | null
}

function PanelRow({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="border-t border-border/50 py-4 first:border-t-0 first:pt-0">
      <p className={LAB_STAT_LABEL_CLASS}>{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  )
}

// Every line here is derived from real session data (recommendationEngine.ts,
// difficultyEngine.ts, readingDnaEngine.ts, goalProgressEngine.ts) — nothing
// is a static template with fabricated numbers.
export function AiCoachPanel({ todaysInsight, coachRecommendation, todaysFocus, dnaUpdate, goalProgress }: AiCoachPanelProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">AI Coach™</p>
      <div className="mt-3">
        <PanelRow label="Today's Insight">{todaysInsight}</PanelRow>
        <PanelRow label="Coach Recommendation">{coachRecommendation}</PanelRow>
        <PanelRow label="Today's Focus">{todaysFocus}</PanelRow>
        {dnaUpdate && (
          <PanelRow label="Reading DNA Update">
            {dnaUpdate.label}. Confidence {dnaUpdate.currentConfidence > dnaUpdate.previousConfidence ? 'increased' : 'changed'} from{' '}
            {dnaUpdate.previousConfidence}% to {dnaUpdate.currentConfidence}%.
          </PanelRow>
        )}
        {goalProgress && (
          <div className="border-t border-border/50 pt-4">
            <p className={LAB_STAT_LABEL_CLASS}>Goal Progress</p>
            <div className="mt-2">
              <GoalProgressBar label={goalProgress.goalTitle} percent={goalProgress.percent} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
