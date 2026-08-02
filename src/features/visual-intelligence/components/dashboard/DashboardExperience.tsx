import type { NeuralEvolutionIndexResult } from '@/features/neural-evolution/neuralEvolutionIndex'
import type { UnlockedAchievement } from '../../adaptive/types/adaptiveTypes'
import type { DnaAchievement, DnaLevelName, MindPassportSnapshot, VisualIdentity } from '../../dna/dnaTypes'
import type { DashboardMission } from '../../dashboard/todaysMissionEngine'
import type { DashboardJourneyStage } from '../../dashboard/journeyProgressEngine'
import type { DayBucket } from '../../dashboard/weeklyProgressEngine'
import type { ExerciseAnalyticsBar } from '../../dashboard/exerciseAnalyticsEngine'
import type { RecentActivityItem } from '../../dashboard/recentActivityEngine'
import type { DashboardStats } from '../../dashboard/dashboardStatsEngine'
import { mergeDashboardAchievements } from '../../dashboard/dashboardAchievements'
import { DashboardHero } from './DashboardHero'
import { TodaysMissionCard } from './TodaysMissionCard'
import { DashboardProgressRings, type DashboardRingsData } from './DashboardProgressRings'
import { JourneyProgressTimeline } from './JourneyProgressTimeline'
import { VisualDnaCompactCard } from './VisualDnaCompactCard'
import { NeuralEvolutionCenterpiece } from './NeuralEvolutionCenterpiece'
import { TodaysAiCoachCard } from './TodaysAiCoachCard'
import { WeeklyProgressChart } from './WeeklyProgressChart'
import { DashboardAchievementsGallery } from './DashboardAchievementsGallery'
import { TrainingCalendarHeatmap } from './TrainingCalendarHeatmap'
import { StatisticsGrid } from './StatisticsGrid'
import { ExerciseAnalyticsChart } from './ExerciseAnalyticsChart'
import { RecentActivityFeed } from './RecentActivityFeed'
import { LeaderboardPlaceholder } from './LeaderboardPlaceholder'
import { MindPassportCompactCard } from './MindPassportCompactCard'
import { NextIntelligenceLabTeaser } from './NextIntelligenceLabTeaser'
import { ExportControls } from './ExportControls'
import { SettingsPreview } from './SettingsPreview'

type DashboardExperienceProps = {
  studentName: string
  currentStreak: number
  dnaLevelName: DnaLevelName
  identity: VisualIdentity
  growthPercent: number | null
  neuralEvolutionResult: NeuralEvolutionIndexResult
  mission: DashboardMission
  ringsData: DashboardRingsData
  journeyStages: readonly DashboardJourneyStage[]
  coachMessage: string
  weeklyDays: readonly DayBucket[]
  calendarDays: readonly DayBucket[]
  adaptiveAchievements: readonly UnlockedAchievement[]
  dnaAchievements: readonly DnaAchievement[]
  stats: DashboardStats
  exerciseAnalytics: readonly ExerciseAnalyticsBar[]
  recentActivity: readonly RecentActivityItem[]
  mindPassportSnapshot: MindPassportSnapshot | null
  achievementCount: number
  shareSummaryText: string
}

export function DashboardExperience({
  studentName,
  currentStreak,
  dnaLevelName,
  identity,
  growthPercent,
  neuralEvolutionResult,
  mission,
  ringsData,
  journeyStages,
  coachMessage,
  weeklyDays,
  calendarDays,
  adaptiveAchievements,
  dnaAchievements,
  stats,
  exerciseAnalytics,
  recentActivity,
  mindPassportSnapshot,
  achievementCount,
  shareSummaryText,
}: DashboardExperienceProps): React.JSX.Element {
  const mergedAchievements = mergeDashboardAchievements(adaptiveAchievements, dnaAchievements)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <DashboardHero
        studentName={studentName}
        currentStreak={currentStreak}
        dnaLevelName={dnaLevelName}
        neuralEvolutionOverallScore={neuralEvolutionResult.overallScore}
      />
      <TodaysMissionCard mission={mission} />
      <DashboardProgressRings data={ringsData} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Journey Progress™</h2>
        <JourneyProgressTimeline stages={journeyStages} />
      </div>

      <VisualDnaCompactCard identity={identity} dnaLevelName={dnaLevelName} growthPercent={growthPercent} />
      <NeuralEvolutionCenterpiece result={neuralEvolutionResult} />
      <TodaysAiCoachCard message={coachMessage} />
      <WeeklyProgressChart days={weeklyDays} />
      <DashboardAchievementsGallery achievements={mergedAchievements} />
      <TrainingCalendarHeatmap days={calendarDays} />
      <StatisticsGrid stats={stats} />
      <ExerciseAnalyticsChart bars={exerciseAnalytics} />
      <RecentActivityFeed items={recentActivity} />
      <LeaderboardPlaceholder />
      <MindPassportCompactCard snapshot={mindPassportSnapshot} achievementCountFallback={achievementCount} />
      <NextIntelligenceLabTeaser />
      <ExportControls summaryText={shareSummaryText} />
      <SettingsPreview />
    </div>
  )
}
