import type { Metadata } from 'next'
import { createReadingIntelligenceExperience } from '@/features/reading-intelligence'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { VISUAL_ACTIVATION_SEQUENCE } from '@/features/visual-intelligence/visualActivationSequence'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { STAGE_COPY } from '@/features/quantum-speed-reading/stageCopy'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { JourneyHero } from '@/features/quantum-speed-reading/components/dashboard/JourneyHero'
import { JourneyStatsRow } from '@/features/quantum-speed-reading/components/dashboard/JourneyStatsRow'
import { JourneyTimeline, type JourneyTimelineStage } from '@/features/quantum-speed-reading/components/dashboard/JourneyTimeline'
import { TodaysProgress } from '@/features/quantum-speed-reading/components/dashboard/TodaysProgress'
import { LabPillarsGrid } from '@/features/quantum-speed-reading/components/dashboard/LabPillarsGrid'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'
import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'

// Quantum Speed Reading Paywall™ — every stage except Visual Activation™
// requires Pro. Kept as an explicit allowlist of the one free stage
// (rather than a denylist of the three gated ones) so a future 5th stage
// defaults to gated, never accidentally free.
const FREE_STAGE_ID = 'visual-activation'

const ALL_SEQUENCES: readonly ExerciseSequenceItem[] = [...VISUAL_ACTIVATION_SEQUENCE, ...EYE_FOUNDATION_MODULE, ...READING_EXPANSION_MODULE]

// SPRINT-2A — Quantum Speed Reading Library Cleanup™. Core Reading
// Journey™'s own first exercise is always the "skip Reading Preparation™"
// destination — reading it from the real, unmodified module array rather
// than hardcoding the route string.
const SKIP_TO_READING_PRACTICE_HREF = READING_EXPANSION_MODULE[0]?.href ?? '/labs/quantum-speed-reading/phrase-reading'

function formatLastSessionLabel(occurredAt: string, exerciseTitle: string): string {
  const dayMs = 86_400_000
  const occurredDateKey = occurredAt.slice(0, 10)
  const todayKey = new Date().toISOString().slice(0, 10)
  const daysAgo = Math.round((new Date(todayKey).getTime() - new Date(occurredDateKey).getTime()) / dayMs)
  const when = daysAgo <= 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
  return `${exerciseTitle} · ${when}`
}

export const metadata: Metadata = {
  title: 'Quantum Speed Reading Lab™',
  description:
    'Your Brain Transformation Experience™ — Visual Activation™, Reading Preparation™ (optional), Core Reading Journey™, and Reading Intelligence™.',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function findExercisePosition(
  sequence: readonly ExerciseSequenceItem[],
  exerciseId: string | undefined,
): { index: number; total: number } | null {
  if (exerciseId === undefined) return null
  const index = sequence.findIndex((item) => item.exerciseId === exerciseId)
  if (index === -1) return null
  return { index: index + 1, total: sequence.length }
}

// Sprint 49 — Reading Intelligence Lab™ Production Integration. Journey,
// progress, streak, and Mind Score are no longer computed inline here — they
// come from src/features/reading-intelligence/'s
// createReadingIntelligenceExperience(), which performs the exact same
// getModuleProgress/getPracticeSessions/computeJourneyProgress/
// computeDailyStreak/computeReadingScore/computeMindScore/getMindScoreLabel
// sequence this page used to run by hand (Sprint 46 was built by mirroring
// this page precisely, so the rendered output is unchanged). Only the
// current stage's exercise-level detail (title/position, for JourneyHero)
// still needs a local getContinueLearningSummary call, since Sprint 46's
// result doesn't expose per-exercise detail — everything else is a direct
// read of the orchestrator's already-computed values. No journey, progress,
// streak, or scoring logic is duplicated anywhere in this file.
export default async function QuantumSpeedReadingLabPage(): Promise<React.JSX.Element> {
  const [experience, recentSessions, hasProAccess] = await Promise.all([
    createReadingIntelligenceExperience().load(),
    getPracticeSessions('quantum-speed-reading', 1),
    hasQuantumSpeedReadingProAccess(),
  ])
  const { journey, mindScore, mindScoreLabel, streak } = experience.journeyState

  const lastSession = recentSessions[0] ?? null
  const lastSessionExerciseTitle = lastSession !== null ? (ALL_SEQUENCES.find((item) => item.exerciseId === lastSession.exerciseId)?.title ?? null) : null
  const lastSessionLabel =
    lastSession !== null && lastSessionExerciseTitle !== null ? formatLastSessionLabel(lastSession.occurredAt, lastSessionExerciseTitle) : null

  const stageSequences: Record<string, readonly ExerciseSequenceItem[]> = {
    'visual-activation': VISUAL_ACTIVATION_SEQUENCE,
    'reading-preparation': EYE_FOUNDATION_MODULE,
    'core-reading-journey': READING_EXPANSION_MODULE,
  }

  // SPRINT-2A — Reading Preparation™ is optional: Core Reading Journey™ only
  // requires Visual Activation™, the same requirement Reading Preparation™
  // itself already has (see preparation/page.tsx and phrase-reading/page.tsx's
  // matching gate). Real data, not a duplicated check — reads the same
  // progress snapshot the timeline/hero already receive.
  const visualActivationStage = experience.progressSnapshot.stages.find((stage) => stage.stageId === 'visual-activation')?.progress ?? null
  const isVisualActivationComplete = visualActivationStage !== null && visualActivationStage.totalCount > 0 && visualActivationStage.completedCount === visualActivationStage.totalCount

  const currentStage = journey.stages.find((stage) => stage.status === 'current') ?? null
  const currentStageCopy = currentStage !== null ? (STAGE_COPY[currentStage.id] ?? null) : null
  const currentStageProgress =
    currentStage !== null
      ? (experience.progressSnapshot.stages.find((stage) => stage.stageId === currentStage.id)?.progress ?? null)
      : null
  const currentStageSequence = currentStage !== null ? stageSequences[currentStage.id] : undefined
  const currentStageSummary =
    currentStageProgress !== null && currentStageSequence !== undefined
      ? getContinueLearningSummary(currentStageProgress, currentStageSequence)
      : undefined
  const currentExerciseTitle = currentStageSummary?.currentExercise?.title ?? null
  const currentExercisePosition =
    currentStageSequence !== undefined ? findExercisePosition(currentStageSequence, currentStageSummary?.currentExercise?.exerciseId) : null

  // Quantum Speed Reading Paywall™ — a free user sees every non-Visual-
  // Activation™ stage as locked here, regardless of what its real
  // sequential progress would otherwise say (even a stage with real
  // completed exercises from before a subscription lapsed reads as
  // locked again) — the exact same rule the underlying pages themselves
  // now enforce for real via hasQuantumSpeedReadingProAccess.
  const timelineStages: JourneyTimelineStage[] = journey.stages.map((stage) => {
    const isProGatedStage = stage.id !== FREE_STAGE_ID && !hasProAccess
    return {
      id: stage.id,
      icon: STAGE_COPY[stage.id]?.icon ?? '',
      title: stage.title,
      status: isProGatedStage ? 'locked' : stage.status,
      href: stage.href,
      requiresPro: isProGatedStage,
    }
  })

  const nextStageTeaser = currentStage !== null ? (currentStageCopy?.nextStageTeaser ?? null) : null
  const currentStageRequiresPro = currentStage !== null && currentStage.id !== FREE_STAGE_ID && !hasProAccess

  return (
    <div>
      <LabNavHeader currentSection="Lab Home" />
      <div className="mx-auto max-w-2xl space-y-10 px-6 py-16 sm:py-20">
        <JourneyHero
          greeting={getGreeting()}
          currentStageTitle={currentStage?.title ?? null}
          currentStageIcon={currentStageCopy?.icon ?? null}
          currentStageNumber={currentStage !== null ? Math.min(journey.completedStageCount + 1, journey.totalStageCount) : null}
          totalStageCount={journey.totalStageCount}
          missionSupportingLine={currentStageCopy?.missionSupportingLine ?? null}
          estimatedTime={currentStageCopy?.estimatedTime ?? null}
          currentExerciseTitle={currentExerciseTitle}
          exercisePosition={currentExercisePosition}
          continueHref={journey.continueHref}
          isJourneyComplete={journey.isJourneyComplete}
          currentStageRequiresPro={currentStageRequiresPro}
          secondaryHref={isVisualActivationComplete && currentStage?.id === 'reading-preparation' ? SKIP_TO_READING_PRACTICE_HREF : null}
          secondaryLabel="Skip to Reading Practice →"
        />

        <JourneyStatsRow
          currentStreak={streak.currentStreak}
          bestStreak={streak.bestStreak}
          totalXp={experience.xp.totalXp}
          readingLevelLabel={mindScoreLabel}
          lastSessionLabel={lastSessionLabel}
        />

        <div>
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">Your Brain Evolution™</p>
          {nextStageTeaser !== null && <p className="mb-4 text-sm text-muted-foreground">{nextStageTeaser}</p>}
          <JourneyTimeline stages={timelineStages} currentStageId={currentStage?.id ?? null} />
        </div>

        <div>
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">Your Progress</p>
          <TodaysProgress
            completedStageCount={journey.completedStageCount}
            totalStageCount={journey.totalStageCount}
            mindScore={mindScore}
            mindScoreLabel={mindScoreLabel}
          />
        </div>

        <LabPillarsGrid />
      </div>
    </div>
  )
}
