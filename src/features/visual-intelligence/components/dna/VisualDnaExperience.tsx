import type {
  DnaAchievement,
  DnaLevelName,
  DnaLevelNumber,
  EvolutionNote,
  EvolutionStage,
  GrowthOpportunity,
  RadarAxis,
  ScoreProgress,
  StrengthCategory,
  TodaysBestMission,
  VisualIdentity,
} from '../../dna/dnaTypes'
import type { NeuralEvolutionIndexResult } from '@/features/neural-evolution/neuralEvolutionIndex'
import { DnaHeroSection } from './DnaHeroSection'
import { VisualIntelligenceScorePanel } from './VisualIntelligenceScorePanel'
import { VisualIdentityCards } from './VisualIdentityCards'
import { StrengthAnalysisGrid } from './StrengthAnalysisGrid'
import { GrowthOpportunitiesCard } from './GrowthOpportunitiesCard'
import { AiCoachSummaryCard } from './AiCoachSummaryCard'
import { EvolutionTimeline } from './EvolutionTimeline'
import { VisualIntelligenceRadar } from './VisualIntelligenceRadar'
import { DnaLevelBadge } from './DnaLevelBadge'
import { TodaysBestMissionCard } from './TodaysBestMissionCard'
import { DnaAchievementsGrid } from './DnaAchievementsGrid'
import { EvolutionNotesLog } from './EvolutionNotesLog'
import { NeuralEvolutionIndexPanel } from './NeuralEvolutionIndexPanel'
import { FutureIntelligenceMap } from './FutureIntelligenceMap'

type VisualDnaExperienceProps = {
  scoreProgress: ScoreProgress
  identity: VisualIdentity
  strengths: readonly StrengthCategory[]
  growthOpportunities: readonly GrowthOpportunity[]
  coachSummary: string
  evolutionStages: readonly EvolutionStage[]
  radarAxes: readonly RadarAxis[]
  dnaLevel: DnaLevelNumber
  dnaLevelName: DnaLevelName
  mission: TodaysBestMission
  achievements: readonly DnaAchievement[]
  evolutionNotes: readonly EvolutionNote[]
  neuralEvolutionResult: NeuralEvolutionIndexResult
}

export function VisualDnaExperience({
  scoreProgress,
  identity,
  strengths,
  growthOpportunities,
  coachSummary,
  evolutionStages,
  radarAxes,
  dnaLevel,
  dnaLevelName,
  mission,
  achievements,
  evolutionNotes,
  neuralEvolutionResult,
}: VisualDnaExperienceProps): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <DnaHeroSection />
      <VisualIntelligenceScorePanel scoreProgress={scoreProgress} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">AI Visual Identity™</h2>
        <VisualIdentityCards identity={identity} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Strength Analysis™</h2>
        <StrengthAnalysisGrid strengths={strengths} />
      </div>

      <GrowthOpportunitiesCard opportunities={growthOpportunities} />
      <AiCoachSummaryCard summary={coachSummary} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Visual Evolution Timeline™</h2>
        <EvolutionTimeline stages={evolutionStages} />
      </div>

      <VisualIntelligenceRadar axes={radarAxes} />
      <DnaLevelBadge level={dnaLevel} levelName={dnaLevelName} />
      <TodaysBestMissionCard mission={mission} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Achievements™</h2>
        <DnaAchievementsGrid achievements={achievements} />
      </div>

      <EvolutionNotesLog notes={evolutionNotes} />
      <NeuralEvolutionIndexPanel result={neuralEvolutionResult} />
      <FutureIntelligenceMap />
    </div>
  )
}
