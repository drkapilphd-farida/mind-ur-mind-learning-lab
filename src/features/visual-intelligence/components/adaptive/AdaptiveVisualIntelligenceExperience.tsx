import type { AdaptiveEngineResult } from '../../adaptive/types/adaptiveTypes'
import { RecommendationCard } from './RecommendationCard'
import { VisualProgressRingPanel } from './VisualProgressRingPanel'
import { PerformanceMetricsGrid } from './PerformanceMetricsGrid'
import { AchievementsGrid } from './AchievementsGrid'
import { LevelUnlockLadder } from './LevelUnlockLadder'
import { AdaptiveCoachMessage } from './AdaptiveCoachMessage'
import { AdaptiveDashboardWidget } from './AdaptiveDashboardWidget'

type AdaptiveVisualIntelligenceExperienceProps = {
  engineResult: AdaptiveEngineResult
  coachMessage: string
}

// Page-level composition — props-only, no data-fetching of its own. The
// route (page.tsx) fetches stats, runs the adaptive engine, and generates
// the coach message; this component only lays out the result.
export function AdaptiveVisualIntelligenceExperience({
  engineResult,
  coachMessage,
}: AdaptiveVisualIntelligenceExperienceProps): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Lab™</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Visual Adaptation Engine™</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A deterministic coaching layer built entirely from your own real practice history — no camera, no eye tracking, no machine learning.
        </p>
      </div>

      <RecommendationCard recommendation={engineResult.recommendation} />
      <VisualProgressRingPanel levelProgress={engineResult.levelProgress} />
      <AdaptiveCoachMessage message={coachMessage} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Performance</h2>
        <PerformanceMetricsGrid performance={engineResult.performance} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Achievements</h2>
        <AchievementsGrid achievements={engineResult.achievements} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Level Ladder</h2>
        <LevelUnlockLadder currentLevel={engineResult.difficultyLevel} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Dashboard Widget Preview</h2>
        <AdaptiveDashboardWidget engineResult={engineResult} />
      </div>
    </div>
  )
}
