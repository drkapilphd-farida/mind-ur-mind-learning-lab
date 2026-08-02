'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, ListTree, Tags } from 'lucide-react'
import { AIInsightsPanel } from '@/components/learning/AIInsightsPanel'
import { AIObservationCards } from '@/components/learning/AIObservationCards'
import { BlueprintCard } from '@/components/learning/BlueprintCard'
import { JourneyTimeline } from '@/components/learning/JourneyTimeline'
import { KnowledgeMapPreview } from '@/components/learning/KnowledgeMapPreview'
import { LearningModeCard } from '@/components/learning/LearningModeCard'
import { LearningMissionCard } from '@/components/learning/LearningMissionCard'
import { ProgressTimeline } from '@/components/learning/ProgressTimeline'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { ArrivalBackground } from '@/components/welcome/ArrivalBackground'
import { LEARNING_MODES, isLearningModeAvailable, resolveLearningModeHref } from '@/constants/learning/learningModes'
import type { UploadLearningGoalId } from '@/constants/learning/uploadLearningGoals'
import { useBackgroundProcessingPoll } from '@/hooks/learning/useBackgroundProcessingPoll'
import { recommendLearningMode, type RecommendedLearningModeId } from '@/lib/blueprint/recommendLearningMode'
import { trackEvent } from '@/lib/analytics/track'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { deriveJourneyStepStatuses } from '@/lib/learning/deriveJourneyStepStatuses'
import { deriveProjectLifecycle } from '@/lib/learning/deriveProjectLifecycle'
import { analyzeDocumentContent } from '@/lib/processing/analyzeDocumentContent'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { cn } from '@/lib/utils'
import type { LearningBlueprint } from '@/types/learning/blueprint'
import type { LearningProject } from '@/types/learning'
import type { DocumentStatus } from '@/types/documents'

type LearningBlueprintExperienceProps = {
  project: LearningProject
  documentId: string
  documentStatus: DocumentStatus
  documentTitle: string
  documentMimeType: string | null
  documentSizeBytes: number | null
  blueprint: LearningBlueprint
  // AI Learning Studio™ V1 Launch UX Transformation — the learner's own
  // Screen 4 selection (Upload wizard), carried through as a query param.
  // `null` when absent — falls back entirely to the real recommendation
  // engine below, exactly as before this sprint.
  goalId: UploadLearningGoalId | null
}

// Maps the progress row's own `stage` ids (matches
// `document_processing_progress.stage`) to the same real milestone
// labels defined in `BACKGROUND_INTELLIGENCE_STAGES` — kept as a
// dedicated lookup here since that constant's own ids
// (`BackgroundIntelligenceStageId`) are a separate, display-only scheme
// from the durable DB stage enum.
const BACKGROUND_STAGE_LABEL_BY_PROGRESS_STAGE: Record<'enriching_chunks' | 'building_knowledge_graph' | 'building_learning_analysis' | 'generating_blueprints' | 'generating_learning_assets', string> = {
  enriching_chunks: 'Understanding Your Document',
  building_knowledge_graph: 'Mapping Concept Relationships',
  building_learning_analysis: 'Analyzing Difficulty & Learning Path',
  // Reading Intelligence Engine™ Upgrade — Sprint-1.
  generating_blueprints: 'Building Your Learning Blueprint',
  // Reading Intelligence Engine™ Upgrade — Sprint-2. No other UI in this
  // component changes — only this one required label entry, the same
  // minimal addition Sprint-1's own new stage needed to keep this
  // existing status strip compiling and honest about the real stage.
  generating_learning_assets: 'Preparing Your Learning Assets',
}

// ALS-15 Instant Learning Engine™ — the small, non-blocking Background
// Status™ strip. Never a modal, never blocks navigation. Disappears
// entirely once Phase 3 is fully complete (`snapshot.status === 'ready'`)
// — matching this project's "never show progress for something already
// done" discipline. A Phase-3-only failure never takes the workspace
// away (per the approved decision): it shows one quiet, honest notice
// instead of the old full-page error card.
function BackgroundProcessingStatusStrip({ documentId, documentStatus }: { documentId: string; documentStatus: DocumentStatus }): React.JSX.Element | null {
  const { snapshot } = useBackgroundProcessingPoll(documentId, documentStatus)

  if (documentStatus !== 'workspace_ready' || !snapshot) return null
  if (snapshot.status === 'ready') return null

  if (snapshot.stage === 'failed') {
    return (
      <p className={cn(TYPOGRAPHY.caption, 'rounded-xl border border-border/40 bg-card px-4 py-2.5 text-left')}>
        We couldn&apos;t finish deepening this document. The parts you&apos;re already using are unaffected.
      </p>
    )
  }

  const stageLabel = snapshot.stage === 'complete' ? 'Finishing up…' : BACKGROUND_STAGE_LABEL_BY_PROGRESS_STAGE[snapshot.stage]
  const countSuffix = snapshot.stage === 'enriching_chunks' && snapshot.totalChunks > 0 ? ` (${snapshot.chunksEnriched}/${snapshot.totalChunks})` : ''

  return (
    <p className={cn(TYPOGRAPHY.caption, 'flex items-center gap-2 rounded-xl border border-border/40 bg-card px-4 py-2.5 text-left')}>
      <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      {stageLabel}
      {countSuffix}
    </p>
  )
}

// AI Learning Studio™ V1 Launch UX Transformation — a real, honest,
// disclosed UI-level mapping only: `recommendLearningMode.ts` itself is
// untouched, still the real engine every fallback path uses. When the
// learner explicitly told us their goal (Screen 4), that stated
// preference is what's shown as "recommended" here instead of the
// engine's own document-driven pick — never a claim of deeper analysis,
// just honoring what they actually said.
const GOAL_MODE_MAP: Record<UploadLearningGoalId, RecommendedLearningModeId> = {
  'read-faster': 'quantum-speed-reading',
  'remember-longer': 'memory-mode',
  'deep-understanding': 'mind-map',
  'exam-preparation': 'memory-mode',
}

const GOAL_REASON_PHRASE: Record<UploadLearningGoalId, string> = {
  'read-faster': 'read through this material faster',
  'remember-longer': 'build lasting memory of this material',
  'deep-understanding': 'build a deep understanding of this material',
  'exam-preparation': 'prepare for an exam on this material',
}

// Sprint 1 Chunk 4 → Sprint 2 Chunk 1 → Sprint LW-1E → AI Learning
// Studio™ Sprint ALS-6/ALS-7/ALS-8 — Learning Blueprint™ Experience.
// Renders the finished blueprint for a 'ready' Document. The hero's
// "Start Learning" CTA resolves to whichever real, connected Learning
// Mode the AI Recommendation Engine actually recommends (Quantum Speed
// Reading™ or Memory Mode™ today, via the Learning Workspace™), falling
// back to Reading when the recommendation itself isn't connected yet.
// Every Learning Mode (AI Recommendation hero, "Other Available Learning
// Modes™" grid) is now a real `<Link>` into the universal Learning
// Workspace™ — Sprint ALS-8 removed the last click-handler fallback into
// a second, separate "coming soon" screen; the Workspace itself honestly
// shows "Coming in a future production sprint" for any mode with no real
// runtime yet, one single consistent destination for all ten modes.
// `hasStartedLearning` is hardcoded false — see deriveProjectLifecycle's
// own comment for why that's honest, not a shortcut.
//
// Sprint LW-1E — AI Learning Blueprint™. Adds AI Observations™ (replacing
// the old Blueprint Overview cards) and the AI Recommendation Engine™
// hero (recommendLearningMode.ts, a real rule-based function — never
// hardcoded), and reframes the bottom card grid as "Other Available
// Learning Modes™" (excluding whichever mode was just recommended).
//
// AI Learning Studio™ V1 Launch UX Transformation — Screen 6, "Today's
// Mission." What used to be two separate top sections (BlueprintHero +
// AIRecommendationHero) is now one consolidated `LearningMissionCard` —
// the first, immediately-actionable thing a learner sees. Nothing below
// it was deleted: Concepts, Chapters, Topics, Knowledge Map, full AI
// Insights, and the complete mode grid are all still real, still present,
// just no longer competing with the primary action for the first
// impression.
export function LearningBlueprintExperience({
  project,
  documentId,
  documentStatus,
  documentTitle,
  documentMimeType,
  documentSizeBytes,
  blueprint,
  goalId,
}: LearningBlueprintExperienceProps): React.JSX.Element {
  const lifecycle = deriveProjectLifecycle(false)
  const journeySteps = deriveJourneyStepStatuses(blueprint.journey)
  const engineRecommendation = recommendLearningMode(blueprint)
  const recommendation = goalId
    ? { modeId: GOAL_MODE_MAP[goalId], reason: `You told us you want to ${GOAL_REASON_PHRASE[goalId]} — we recommend the mode below to start.` }
    : engineRecommendation
  // QSR-INTEGRATION-1 — Quantum Speed Reading™ is always the primary,
  // first, largest card; every other real mode (including whichever one
  // the AI Recommendation Engine picked) moves into the secondary row
  // below. `recommendLearningMode`/`goalId` are still computed above and
  // still shown honestly — only when they actually agree with what's on
  // the primary card — never displayed as though they justify a mode
  // they don't apply to.
  const otherLearningModes = LEARNING_MODES.filter((mode) => mode.id !== 'quantum-speed-reading')
  // AI Learning Studio™ Sprint ALS-4 — document type and reading time,
  // derived from the document's own real mime type/size (the same
  // function ALS-3's processing pipeline already uses) — distinct from,
  // and always real alongside, `blueprint`'s own now-real
  // Claude-enriched fields (Production AI Integration).
  const contentAnalysis = analyzeDocumentContent({ mimeType: documentMimeType, sizeBytes: documentSizeBytes })
  // QSR-INTEGRATION-1 — Quantum Speed Reading™ is now always the
  // Blueprint's primary CTA, regardless of what the AI Recommendation
  // Engine picks (`recommendLearningMode`/`selectPrimaryLearningMode`
  // remain real and unmodified — they now only decide the *reason
  // copy shown on this card*, not which mode occupies it). Reuses
  // resolveLearningModeHref verbatim — no new routing logic.
  const primaryMode = LEARNING_MODES.find((candidate) => candidate.id === 'quantum-speed-reading')
  if (!primaryMode) throw new Error('Expected a Learning Mode definition for "quantum-speed-reading"')
  const startLearningHref = resolveLearningModeHref(primaryMode, project.id)
  // Only surface the engine's own reason copy when it actually agrees
  // Quantum Speed Reading is the right call — otherwise an honest,
  // always-true fallback, never a reason attached to the wrong mode.
  const primaryReason = recommendation.modeId === 'quantum-speed-reading' ? recommendation.reason : 'Your primary way to work through this document.'

  useEffect(() => {
    trackEvent('blueprint_viewed', { projectId: project.id, documentId: blueprint.documentId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function trackModeClick(label: string): void {
    trackEvent('ready_to_learn_clicked', { projectId: project.id, action: label })
  }

  return (
    <div className="relative overflow-hidden">
      <ArrivalBackground />

      <div className="relative mx-auto max-w-3xl space-y-10 px-6 py-12">
        <Link href="/preview/learning-studio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={ICON_SIZE.sm} aria-hidden="true" />
          AI Learning Studio™
        </Link>

        <BackgroundProcessingStatusStrip documentId={documentId} documentStatus={documentStatus} />

        <LearningMissionCard
          projectTitle={project.title}
          documentTitle={documentTitle}
          startingChapterTitle={blueprint.chapters[0]?.title ?? null}
          estimatedReadingMinutes={contentAnalysis.estimatedReadingMinutes}
          difficulty={blueprint.difficulty}
          recommendedModeEmoji={primaryMode.emoji}
          recommendedModeTitle={primaryMode.title}
          recommendedReason={primaryReason}
          startLearningHref={startLearningHref}
          onStartLearningClick={() => trackModeClick('Start Learning')}
        />

        <section>
          <p className={TYPOGRAPHY.label}>Explore More</p>
          <div className="mt-3">
            <AIObservationCards blueprint={blueprint} estimatedReadingMinutes={contentAnalysis.estimatedReadingMinutes} />
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Other Available Learning Modes™</p>
          {/* QSR-INTEGRATION-1 — "Netflix-style" row: a horizontal,
              snap-scrolling shelf reusing LearningModeCard completely
              unchanged, just laid out narrower and side-by-side instead of
              a uniform grid. No carousel library — plain flex + overflow. */}
          <div className="mt-3 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0">
            {otherLearningModes.map((mode) => (
              <div key={mode.id} className="w-64 shrink-0 snap-start">
                <LearningModeCard
                  emoji={mode.emoji}
                  title={mode.title}
                  description={mode.description}
                  href={resolveLearningModeHref(mode, project.id)}
                  comingSoon={!isLearningModeAvailable(mode.id)}
                  onClick={() => trackModeClick(mode.title)}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Project Progress</p>
          <div className="mt-3">
            <ProgressTimeline stages={lifecycle} />
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Primary Concepts</p>
          <div className="mt-3">
            {blueprint.concepts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {blueprint.concepts.map((concept) => (
                  <BlueprintCard key={concept.id} icon={Lightbulb} title={concept.title} description={concept.description} />
                ))}
              </div>
            ) : (
              <EmptyStateCard icon={Lightbulb} title="No concepts found yet" description="This Learning Blueprint™ doesn't have any concepts to show yet." />
            )}
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Chapters</p>
          <div className="mt-3">
            {blueprint.chapters.length > 0 ? (
              <Card>
                <CardContent>
                  <ol className="space-y-2">
                    {blueprint.chapters.map((chapter, index) => (
                      <li key={chapter.id} className="flex items-center gap-3">
                        <span className={cn(TYPOGRAPHY.caption, 'w-5 shrink-0 tabular-nums')}>{index + 1}.</span>
                        <span className={TYPOGRAPHY.body}>{chapter.title}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <EmptyStateCard icon={ListTree} title="No chapters found yet" description="This Learning Blueprint™ doesn't have a chapter breakdown yet." />
            )}
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Topics</p>
          <div className="mt-3">
            {blueprint.topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {blueprint.topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyStateCard icon={Tags} title="No topics found yet" description="This Learning Blueprint™ doesn't have any topics to show yet." />
            )}
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Learning Journey™</p>
          <div className="mt-3">
            <JourneyTimeline steps={journeySteps} />
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>Knowledge Map Preview</p>
          <div className="mt-3 max-w-xl">
            <KnowledgeMapPreview nodes={blueprint.knowledgeMap} />
          </div>
        </section>

        <section>
          <p className={TYPOGRAPHY.label}>AI Insights</p>
          <div className="mt-3">
            <AIInsightsPanel insights={blueprint.insights} />
          </div>
        </section>
      </div>
    </div>
  )
}
