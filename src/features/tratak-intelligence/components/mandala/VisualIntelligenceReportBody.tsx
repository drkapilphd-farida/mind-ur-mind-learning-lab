import { Sparkles, TrendingUp } from 'lucide-react'
import type { VisualIntelligenceReport } from '../../actions/completeTratakMissionSession'
import type { VisualIntelligenceScores } from '../../imageFixation/visualIntelligenceRecommendation'

const SCORE_LABELS: Record<keyof VisualIntelligenceScores, string> = {
  observationAccuracy: 'Observation Accuracy™',
  fixationStability: 'Fixation Stability™',
  afterImageAwareness: 'After-Image Awareness™',
  attentionScore: 'Attention Score™',
  visualRecall: 'Visual Recall™',
}

type VisualIntelligenceReportBodyProps = {
  report: VisualIntelligenceReport
  xpEarned: number
  journeyProgressPercent: number
  // Real lab-wide Neural Evolution Index™, captured once at page load and
  // once fresh after this session's save — the delta is always the true
  // difference of those two honest reads, never a fabricated estimate.
  neuralEvolutionBeforeScore: number
  neuralEvolutionAfterScore: number
}

// Shared by both MandalaLevelCompleteScreen and MandalaCompletionScreen so
// the report is presented identically whether a level or the whole mission
// just finished.
export function VisualIntelligenceReportBody({
  report,
  xpEarned,
  journeyProgressPercent,
  neuralEvolutionBeforeScore,
  neuralEvolutionAfterScore,
}: VisualIntelligenceReportBodyProps): React.JSX.Element {
  const neuralEvolutionDelta = neuralEvolutionAfterScore - neuralEvolutionBeforeScore
  const deltaLabel = `${neuralEvolutionDelta >= 0 ? '+' : ''}${neuralEvolutionDelta}`

  return (
    <div className="w-full rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Report™</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(Object.keys(SCORE_LABELS) as (keyof VisualIntelligenceScores)[]).map((key) => (
          <div key={key} className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-base font-semibold text-foreground">{report[key]}%</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{SCORE_LABELS[key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/30 p-3 text-center">
          <p className="text-base font-semibold text-foreground">+{xpEarned} XP</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">XP Earned</p>
        </div>
        <div className="rounded-xl bg-muted/30 p-3 text-center">
          <p className="text-base font-semibold text-foreground">{journeyProgressPercent}%</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Current Journey Progress</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
        <TrendingUp className="size-3.5 text-primary" aria-hidden="true" />
        Neural Evolution Index™ {deltaLabel} — now {neuralEvolutionAfterScore}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-left text-xs leading-relaxed text-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <p>{report.recommendation}</p>
      </div>
    </div>
  )
}
