import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { JourneyHero } from '@/features/quantum-speed-reading/components/dashboard/JourneyHero'
import { JourneyTimeline, type JourneyTimelineStage } from '@/features/quantum-speed-reading/components/dashboard/JourneyTimeline'
import { STAGE_COPY } from '@/features/quantum-speed-reading/stageCopy'
import { MindScoreCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/MindScoreCard'
import { ContinueLearningCard } from '@/components/exercises/ContinueLearningCard'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { Button } from '@/components/ui/button'
import { DailyMissionBanner } from '@/features/premium-reading-player'
import { getMindScoreLabel } from '@/lib/exercises/mindScore'
import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingIntelligenceJourney } from '@/features/reading-intelligence-journey'
import { buildReadingSessionStatus } from '../status'
import { buildReadingNextRecommendation } from '../recommendation'
import { ReadingSessionStatusCard } from './ReadingSessionStatusCard'
import { NextRecommendationCard } from './NextRecommendationCard'

type ReadingIntelligenceDashboardExperienceProps = {
  greeting: string
  experience: ReadingIntelligenceExperienceResult
  journey: ReadingIntelligenceJourney
}

// The "world-class premium learning experience" composition (§ brief) —
// arranges 13 already-real, already-live components plus this feature's own
// 2 new ones (ReadingSessionStatusCard, NextRecommendationCard) around
// already-loaded Sprint 46/48 data. No engine, dataset, scoring, streak, or
// journey logic lives here — every number is a direct read of `experience`/
// `journey`, both supplied by the caller. See this feature's root index.ts
// for the full 15-item reuse map.
//
// JourneyHero is called with currentExerciseTitle/exercisePosition as null —
// deliberately, to avoid showing the same exercise-level detail twice
// alongside ReadingSessionStatusCard, which now owns that role exclusively.
//
// getMindScoreLabel(mindScore) is called here to obtain the *description*
// string ai-reading-coach/MindScoreCard needs (Sprint 46 only exposes the
// label, not the description). This is a pure, deterministic label lookup on
// an already-computed score — not a recomputation of the score itself
// (computeMindScore/computeReadingScore stay exclusively inside Sprint 46's
// confined seam) — the same distinction Sprint 46/48 draw between "reused
// data" and "reused labeling."
//
// Loading and error states are intentionally NOT rendered here — they
// remain the existing app.tsx-level loading.tsx/error.tsx mechanism.
export function ReadingIntelligenceDashboardExperience({
  greeting,
  experience,
  journey,
}: ReadingIntelligenceDashboardExperienceProps): React.JSX.Element {
  const { dailyMission, progressSnapshot } = experience
  const { journey: journeyProgress, mindScore, mindScoreLabel } = experience.journeyState

  if (progressSnapshot.overallCompletedCount === 0) {
    return (
      <EmptyStateCard
        icon={BookOpen}
        title="Ready to start your Reading Journey™?"
        description="Complete your first exercise to unlock your Reading Journey, Mind Score™, and personalized recommendations."
        action={
          <Button asChild size="lg" className="rounded-full">
            <Link href={journeyProgress.continueHref}>Start Reading</Link>
          </Button>
        }
        className="mx-auto max-w-lg"
      />
    )
  }

  const currentStage = journeyProgress.stages.find((stage) => stage.status === 'current') ?? null
  const currentStageCopy = currentStage !== null ? (STAGE_COPY[currentStage.id] ?? null) : null

  const timelineStages: JourneyTimelineStage[] = journeyProgress.stages.map((stage) => ({
    id: stage.id,
    icon: STAGE_COPY[stage.id]?.icon ?? '',
    title: stage.title,
    status: stage.status,
    href: stage.href,
  }))

  const status = buildReadingSessionStatus(experience)
  const recommendation = buildReadingNextRecommendation(journey)
  const mindScoreDescription = getMindScoreLabel(mindScore).description

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16 lg:max-w-4xl">
      <JourneyHero
        greeting={greeting}
        currentStageTitle={currentStage?.title ?? null}
        currentStageIcon={currentStageCopy?.icon ?? null}
        currentStageNumber={currentStage !== null ? Math.min(journeyProgress.completedStageCount + 1, journeyProgress.totalStageCount) : null}
        totalStageCount={journeyProgress.totalStageCount}
        missionSupportingLine={currentStageCopy?.missionSupportingLine ?? null}
        estimatedTime={currentStageCopy?.estimatedTime ?? null}
        currentExerciseTitle={null}
        exercisePosition={null}
        continueHref={journeyProgress.continueHref}
        isJourneyComplete={journeyProgress.isJourneyComplete}
      />

      <ReadingSessionStatusCard status={status} />

      <DailyMissionBanner missionText={dailyMission.actionLabel} />

      <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
        <ContinueLearningCard
          eyebrow="Continue Learning"
          title={dailyMission.stageTitle}
          actionLabel={dailyMission.actionLabel}
          actionHref={dailyMission.continueHref}
          completedCount={progressSnapshot.overallCompletedCount}
          totalCount={progressSnapshot.overallTotalCount}
          lastCompletedTitle={null}
          isComplete={dailyMission.isAllDone}
          variant="compact"
        />
        <MindScoreCard mindScore={mindScore} label={mindScoreLabel} description={mindScoreDescription} />
      </div>

      <JourneyTimeline stages={timelineStages} currentStageId={currentStage?.id ?? null} />

      <NextRecommendationCard recommendation={recommendation} />
    </div>
  )
}
