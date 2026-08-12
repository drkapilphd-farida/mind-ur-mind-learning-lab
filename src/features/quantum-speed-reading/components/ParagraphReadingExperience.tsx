'use client'

// Paragraph Reading™ Experience — Reading Intelligence Pack™'s Mission 5.
// A genuinely new cognitive stage, NOT an extension of Sentence Reading:
// the entire paragraph is visible at once (no sentence/phrase/word
// flashing, no scrolling), and a slowly moving semi-transparent reading
// guide paces the eye down the page. The Brain Challenge tests
// whole-paragraph UNDERSTANDING (Main Idea, Inference, Cause and Effect,
// Vocabulary in Context, Best Title, Summary Selection, Supporting
// Detail, Meaning Relationship) — never recall of sentence order or
// wording. Design language: Apple + Kindle + Notion — minimal, generous
// whitespace, no gaming effects, no confetti, no badges.
//
// Progression model: "Mission 1 of 20" is the real gating unit (mirrors
// SentenceReadingLevel being Sentence Reading's gating unit); "Level"
// (1-5, word-count tier) is a DERIVED, presentational value
// (`paragraphLevelForMission`) shown as difficulty stars — never a
// separate gate. A mission attempt (1 paragraph + 8 questions) is fully
// known upfront, same "no growth within an attempt" shape Sentence
// Reading's chapter model uses — `items` only grows at the
// Continue/Try-Again mission-transition boundary, which is exactly where
// the deferred-response pattern below is required.
//
// Architecturally related to every mission in this pack (Mission → Level
// → Practice → Brain Challenge → Pass/Retry → Continue → Mission Complete)
// — re-implemented here rather than imported, since every locked mission
// in this pack stays an independently self-contained feature folder.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { ChoiceGrid } from '@/components/exercise-engine/ChoiceGrid'
import { RuntimeResultScreen, type RuntimeResultExtraStat, type RuntimeResultLabels } from '@/components/exercise-engine/RuntimeResultScreen'
import { ReadingJourney } from '@/components/exercise-engine/ReadingJourney'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { useExercisePhaseTimer, type PhaseConfig } from '@/hooks/exercises/useExercisePhaseTimer'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { useUniversalExerciseRuntime } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import type { ItemResponse, DifficultyTier, SessionItem } from '@/types/exercise-engine'
import { PARAGRAPH_READING_DEFINITION } from '../definitions/paragraphReadingDefinition'
import {
  paragraphLevelForMission,
  getParagraphMissionRequirement,
  computeParagraphMissionPassed,
  paragraphReadingStartingMission,
  PARAGRAPH_READING_LEVEL_DEFAULT_TIER,
  PARAGRAPH_READING_MS_PER_WORD,
  PARAGRAPH_READING_LEVEL_NAME,
  PARAGRAPH_READING_LENGTH_LABEL,
  paragraphDifficultyStars,
  type ParagraphReadingLevel,
  type ParagraphReadingMission,
} from '../paragraphDifficulty'
import {
  getParagraphForLevel,
  PARAGRAPH_TOPIC_NAME,
  type ParagraphContent,
} from '../paragraphLibrary'
import type { ParagraphChallengeType } from '../paragraphChallengeLibrary'
import { buildParagraphChallenges, computeParagraphSessionWpm, computeComprehensionPercent, computeBestStreak, type ParagraphChallengeMeta } from '../paragraphEngine'
import {
  buildParagraphReadingRecommendation,
  computeMeaningBlockRhythm,
  computeMeaningRecognitionLabel,
  computeMissionCoachLine,
  computeTopicMastery,
  computeTodaysAchievement,
} from '../paragraphRecommendation'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'
// Reused, read-only, from Word Flash — same precedent every mission in this pack already established.
import { computeFlashXp } from '../../flash-intelligence/wordFlashEngine'
import { getCurriculumSmartCompleteHref, getCurriculumSmartExitHref, isCurriculumSessionCurrentExercise } from '@/features/thirty-day-curriculum/curriculumReturnRouting'

const EXERCISE_ID = 'paragraph-reading'
const LAB_HREF = '/labs/quantum-speed-reading'
// Sprint-12: Fixation Reduction is Core Reading Journey™'s capstone —
// Mission Complete continues forward into it instead of dead-ending back
// at the lab.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/fixation-reduction'
const TOTAL_MISSIONS = 20

const FEEDBACK_MS = 450
const MISSION_INTRO_MS = 1200
const BRAIN_PAUSE_MS = 400
const MIN_READING_MS = 4000

// Fixed (never FitText-fluid) typography for the reading block — paragraph
// line-wrapping must stay stable and measurable so the reading guide can
// track real authored lines, a deliberate departure from every other
// mission's fluid FitText usage.
const READING_FONT_SIZE_PX = 19
const READING_LINE_HEIGHT_PX = 34

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Comprehension Strengthened',
  correctLabel: 'Correct Answers',
  speedLabel: 'Pace',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Avg Response',
  practiceAgainLabel: 'Start New Session',
  nextLabel: 'Back to Lab →',
}

// Positive-only feedback microcopy, own register — never "Wrong"/"Incorrect"/"Bad".
const POSITIVE_FEEDBACK_LINES = ['Meaning Understood', 'Clear Comprehension', 'Strong Grasp'] as const
const KEEP_READING_LINE = 'Keep Reading'

// Mission Complete star rating — a purely presentational transform of the
// session's own already-computed accuracy metric. UI polish only.
function starRatingFromAccuracy(accuracyPercent: number): string {
  const filled = accuracyPercent >= 95 ? 5 : accuracyPercent >= 85 ? 4 : accuracyPercent >= 70 ? 3 : accuracyPercent >= 50 ? 2 : 1
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

function levelParagraphDescriptor(level: ParagraphReadingLevel): string {
  if (level === 1) return 'short, single-idea paragraphs'
  if (level === 2) return 'slightly longer paragraphs with more context'
  if (level === 3) return 'connected, multi-sentence paragraphs'
  if (level === 4) return 'layered paragraphs with several supporting details'
  return 'full-length paragraphs with complex, connected ideas'
}

// A mission attempt's fully-resolved content — the paragraph itself, plus
// the 8 mandatory Brain Challenge questions the engine built from it.
// Never grows mid-attempt — only at the Continue/Try-Again boundary.
type MissionBlock = {
  tier: DifficultyTier
  mission: ParagraphReadingMission
  level: ParagraphReadingLevel
  paragraph: ParagraphContent
  questions: SessionItem[]
  challenges: ParagraphChallengeMeta[]
}

// ── Reading guide — the paragraph's signature mechanic. The ENTIRE
//    paragraph is visible immediately; a semi-transparent horizontal strip
//    moves continuously downward (never scroll, never a stepped jump) at a
//    pace derived from `useExercisePhaseTimer`'s single 'reading' phase.
//    Reduced motion swaps the moving strip for a static per-line highlight
//    that advances discretely — same signal, zero continuous animation.

type ReadingPhaseId = 'reading'

function ParagraphReadingBlock({
  paragraph,
  msPerWord,
  prefersReducedMotion,
  onComplete,
}: {
  paragraph: ParagraphContent
  msPerWord: number
  prefersReducedMotion: boolean
  onComplete: (durationMs: number) => void
}): React.JSX.Element {
  const phases = useMemo<PhaseConfig<ReadingPhaseId>[]>(
    () => [{ id: 'reading', durationMs: Math.max(MIN_READING_MS, paragraph.wordCount * msPerWord) }],
    [paragraph, msPerWord],
  )
  const timer = useExercisePhaseTimer(phases, onComplete)
  const lineCount = paragraph.lines.length
  const guideTopPx = timer.progress * READING_LINE_HEIGHT_PX * Math.max(0, lineCount - 1)
  const activeLineIndex = Math.min(lineCount - 1, Math.floor(timer.progress * lineCount))

  return (
    <div className="mx-auto w-full max-w-[720px] px-6" role="article" aria-label={paragraph.title}>
      <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {paragraph.title}
      </p>
      <div className="relative">
        {!prefersReducedMotion && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 rounded-sm bg-foreground/[0.07]"
            style={{ height: READING_LINE_HEIGHT_PX, transform: `translateY(${guideTopPx}px)` }}
          />
        )}
        <div className="relative">
          {paragraph.lines.map((line, i) => (
            <p
              key={i}
              className={cn(
                'text-foreground',
                prefersReducedMotion && i === activeLineIndex && 'rounded-sm bg-foreground/[0.08]',
              )}
              style={{ fontSize: READING_FONT_SIZE_PX, lineHeight: `${READING_LINE_HEIGHT_PX}px` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Persistent HUD — always visible during 'playing'. Minimal: mission
//    count, a slim overall-arc progress bar, difficulty stars, journey.

function MissionHud({ mission, level }: { mission: ParagraphReadingMission; level: ParagraphReadingLevel }): React.JSX.Element {
  return (
    <div className="absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-center">
      <p className="text-xs font-medium tabular-nums text-muted-foreground">Mission {mission} of {TOTAL_MISSIONS}</p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted-foreground/15" role="progressbar" aria-valuenow={mission} aria-valuemin={1} aria-valuemax={TOTAL_MISSIONS} aria-label={`Mission ${mission} of ${TOTAL_MISSIONS}`}>
        <div className="h-full rounded-full bg-foreground/70 transition-[width] duration-500 ease-out" style={{ width: `${(mission / TOTAL_MISSIONS) * 100}%` }} />
      </div>
      <p className="text-[10px] tracking-wide text-muted-foreground/80" aria-label={`Difficulty: ${paragraphDifficultyStars(level)}`}>
        <span aria-hidden="true">{paragraphDifficultyStars(level)}</span>
        <span className="ml-1.5">{PARAGRAPH_READING_LEVEL_NAME[level]}</span>
      </p>
      <ReadingJourney currentStage="paragraph" compact />
    </div>
  )
}

// ── Session — everything between Mission Ready and Mission Complete.

type QuestionSubPhase = 'response' | 'feedback'
type SessionSubPhase = 'missionIntro' | 'reading' | 'pause' | 'question' | 'passScreen' | 'failScreen'

type EvalData = {
  mission: ParagraphReadingMission
  level: ParagraphReadingLevel
  percent: number
  requiredPercent: number
  passed: boolean
}

function ParagraphReadingSession({
  tier,
  totalSessions,
  onRestart,
  seed,
}: {
  tier: DifficultyTier
  totalSessions: number
  onRestart: () => void
  seed: number
}): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const router = useRouter()
  const startingMission = paragraphReadingStartingMission(tier)

  // ── One paragraph per mission attempt — fully resolved upfront, never
  //    grown mid-attempt ────────────────────────────────────────────────
  // `seed` is server-generated (see page.tsx) and passed down as a prop so
  // the very first render is identical between SSR and hydration — a bare
  // `Date.now()` here previously ticked between the server render and the
  // client's hydration render, so each picked a different paragraph and
  // React discarded the whole tree with a hydration-mismatch error.
  const sessionSeedRef = useRef(seed)
  const generationCountRef = useRef(0)
  const usedParagraphIdsRef = useRef(new Set<string>())

  const fetchMissionBlock = useCallback((mission: ParagraphReadingMission): MissionBlock | null => {
    const level = paragraphLevelForMission(mission)
    const roundTier = PARAGRAPH_READING_LEVEL_DEFAULT_TIER[level]
    const genSeed = sessionSeedRef.current + generationCountRef.current * 104729
    generationCountRef.current += 1

    const paragraph = getParagraphForLevel(level, usedParagraphIdsRef.current, genSeed)
    const built = buildParagraphChallenges(paragraph, genSeed)
    if (built.questions.length === 0) return null

    usedParagraphIdsRef.current.add(paragraph.id)
    return { tier: roundTier, mission, level, paragraph, questions: built.questions, challenges: built.challenges }
  }, [])

  const [blocks, setBlocks] = useState<MissionBlock[]>(() => {
    const first = fetchMissionBlock(startingMission)
    return first ? [first] : []
  })
  const [currentMission, setCurrentMission] = useState<ParagraphReadingMission>(startingMission)

  const highestMissionThisSession = useRef<ParagraphReadingMission>(startingMission)
  const highestLevelThisSession = useRef<ParagraphReadingLevel>(paragraphLevelForMission(startingMission))
  const passedAnyMissionThisSessionRef = useRef(false)
  const lastPassedTopicRef = useRef<string | null>(null)

  const { items, itemToBlockIndex, itemToQuestionIndex } = useMemo(() => {
    const flatItems = blocks.flatMap((b) => b.questions)
    const blockIndexMap: number[] = []
    const questionIndexMap: number[] = []
    blocks.forEach((block, blockIdx) => {
      block.questions.forEach((_, qIdx) => {
        blockIndexMap.push(blockIdx)
        questionIndexMap.push(qIdx)
      })
    })
    return { items: flatItems, itemToBlockIndex: blockIndexMap, itemToQuestionIndex: questionIndexMap }
  }, [blocks])

  const onSessionComplete = useCallback(async (result: RuntimeResult): Promise<void> => {
    await savePracticeSession({
      labId: PARAGRAPH_READING_DEFINITION.labId,
      exerciseId: PARAGRAPH_READING_DEFINITION.id,
      durationMs: Math.max(1, result.metrics.sessionDurationMs),
      completed: result.metrics.accuracyPercent >= PARAGRAPH_READING_DEFINITION.adaptiveRules.minAccuracyToComplete,
    })
  }, [])

  const runtime = useUniversalExerciseRuntime({
    definition: PARAGRAPH_READING_DEFINITION,
    items,
    nextExerciseHref: NEXT_EXERCISE_HREF,
    onSessionComplete,
  })

  const [subPhase, setSubPhase] = useState<SessionSubPhase>('missionIntro')
  const [questionSelectedIndex, setQuestionSelectedIndex] = useState<number | null>(null)
  const [questionSubPhase, setQuestionSubPhase] = useState<QuestionSubPhase>('response')
  const [evalData, setEvalData] = useState<EvalData | null>(null)
  const isVictoryRevealed = useMicroVictoryReveal(1500, evalData?.mission)
  // Sprint-16 — Delight Layer™. See ProgressiveChunkReadingExperience.tsx
  // for the full rationale — computeMissionCoachLine below keeps reading
  // the raw evalData.percent, never this animated value.
  const animatedPercent = useCountUp(evalData?.percent ?? 0, 700, prefersReducedMotion)
  const questionStartTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptResponsesRef = useRef<ItemResponse[]>([])
  const sessionResponsesRef = useRef<ItemResponse[]>([]) // whole-session log, across every attempt — Best Streak needs this
  const sessionTypedResponsesRef = useRef<{ isCorrect: boolean; type: ParagraphChallengeType }[]>([]) // whole-session, type-tagged — Comprehension needs this
  const totalWordsReadRef = useRef(0)
  const totalReadingMsRef = useRef(0)
  const leveledUpThisSessionRef = useRef(false)

  // A response answered on the LAST question of a mission attempt is held
  // here until the learner clicks Continue/Try Again — the Pass/Fail
  // screen must render on stale `items` before the next mission grows it.
  const pendingEvalResponseRef = useRef<ItemResponse | null>(null)

  // Growing `blocks` at the Continue/Try-Again boundary means
  // `runtime.recordResponse` must be called with a closure that has
  // already seen the new, longer `items` array — calling it in the same
  // tick as the `setBlocks()` that grows it would still use the stale
  // (shorter) closure, and the runtime would think the session ended
  // after the LAST item of the just-finished mission instead of
  // continuing into the newly-added next mission. Recording is deferred
  // exactly one render via this ref + a version counter that forces the
  // effect below to re-run once the growth has landed — this is the exact
  // pattern Sentence Reading's rebuild originally dropped and had to
  // restore after a live progression bug (Continue → premature Mission
  // Complete after Level 1); built in correctly here from the start.
  const pendingResponseRef = useRef<ItemResponse | null>(null)
  const [pendingResponseVersion, setPendingResponseVersion] = useState(0)

  useEffect(() => {
    if (pendingResponseRef.current === null) return
    const toRecord = pendingResponseRef.current
    pendingResponseRef.current = null
    runtime.recordResponse(toRecord)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingResponseVersion, runtime.recordResponse])

  function clearTimer(): void {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
  }

  const currentBlockIndex = itemToBlockIndex[runtime.currentIndex] ?? Math.max(0, blocks.length - 1)
  const currentBlock = blocks[currentBlockIndex] ?? null
  const currentQuestionIndex = itemToQuestionIndex[runtime.currentIndex] ?? 0
  const currentChallenge = currentBlock?.challenges[currentQuestionIndex] ?? null
  const currentItem = items[runtime.currentIndex] ?? null
  const missionRequirement = getParagraphMissionRequirement(currentMission)

  // Mission Intro — a brief, minimal beat before the paragraph appears.
  useEffect(() => {
    if (subPhase !== 'missionIntro' || runtime.phase !== 'playing') return
    const introTimer = setTimeout(() => setSubPhase('reading'), MISSION_INTRO_MS)
    return () => clearTimeout(introTimer)
  }, [subPhase, currentBlockIndex, runtime.phase])

  const handleReadingComplete = useCallback((durationMs: number): void => {
    if (currentBlock) {
      totalWordsReadRef.current += currentBlock.paragraph.wordCount
      totalReadingMsRef.current += durationMs
    }
    setSubPhase('pause')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlockIndex])

  // The mandatory brain-pause beat before the Brain Challenge mounts.
  useEffect(() => {
    if (subPhase !== 'pause') return
    const pauseTimer = setTimeout(() => {
      setSubPhase('question')
      questionStartTimeRef.current = Date.now()
    }, BRAIN_PAUSE_MS)
    return () => clearTimeout(pauseTimer)
  }, [subPhase])

  function handleSelect(idx: number): void {
    if (questionSubPhase !== 'response' || !currentItem || !currentBlock || !currentChallenge) return
    const reactionTimeMs = Date.now() - questionStartTimeRef.current
    setQuestionSelectedIndex(idx)
    setQuestionSubPhase('feedback')

    const response: ItemResponse = {
      itemId: currentItem.id,
      selectedIndex: idx,
      correctIndex: currentItem.correctIndex,
      isCorrect: idx === currentItem.correctIndex,
      reactionTimeMs,
      skipped: false,
    }
    const questionType = currentChallenge.type

    clearTimer()
    timerRef.current = setTimeout(() => {
      setQuestionSelectedIndex(null)
      setQuestionSubPhase('response')

      sessionResponsesRef.current.push(response)
      sessionTypedResponsesRef.current.push({ isCorrect: response.isCorrect, type: questionType })
      attemptResponsesRef.current.push(response)

      const isLastQuestionOfMission = currentQuestionIndex + 1 >= currentBlock.questions.length

      if (!isLastQuestionOfMission) {
        // More questions remain in THIS mission's Brain Challenge — all 8
        // were built together upfront and already live in `items`, so no
        // growth is needed.
        questionStartTimeRef.current = Date.now()
        runtime.recordResponse(response)
        return
      }

      // Last question of the mission's Brain Challenge — evaluate, but do
      // NOT record the response or grow `blocks` yet. The Pass/Fail
      // screen waits for an explicit Continue/Try Again click.
      const correctCount = attemptResponsesRef.current.filter((r) => r.isCorrect).length
      const totalCount = attemptResponsesRef.current.length
      const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
      const passed = computeParagraphMissionPassed(percent, missionRequirement.requiredPercent)
      if (passed) {
        passedAnyMissionThisSessionRef.current = true
        lastPassedTopicRef.current = currentBlock.paragraph.topic
      }
      pendingEvalResponseRef.current = response
      setEvalData({ mission: currentMission, level: currentBlock.level, percent, requiredPercent: missionRequirement.requiredPercent, passed })
      setSubPhase(passed ? 'passScreen' : 'failScreen')
    }, FEEDBACK_MS)
  }

  function beginNextAttempt(mission: ParagraphReadingMission): void {
    const response = pendingEvalResponseRef.current
    if (response === null) return
    pendingEvalResponseRef.current = null

    const nextBlock = fetchMissionBlock(mission)
    if (nextBlock === null) {
      // Pool exhausted — never fabricate; end gracefully here.
      runtime.recordResponse(response)
      return
    }

    setCurrentMission(mission)
    if (mission > highestMissionThisSession.current) highestMissionThisSession.current = mission
    if (nextBlock.level > highestLevelThisSession.current) highestLevelThisSession.current = nextBlock.level
    attemptResponsesRef.current = []
    setEvalData(null)
    pendingResponseRef.current = response
    setBlocks((prev) => [...prev, nextBlock])
    setPendingResponseVersion((v) => v + 1)
    setSubPhase('missionIntro')
  }

  function handleContinue(): void {
    if (evalData === null) return
    if (evalData.mission >= TOTAL_MISSIONS) {
      // Mission 20 passed — nothing left to unlock. This is the one true
      // ending: `blocks` never grows again, so the response can be
      // recorded directly with the current (already-correct) closure.
      const response = pendingEvalResponseRef.current
      pendingEvalResponseRef.current = null
      if (response !== null) runtime.recordResponse(response)
      return
    }
    const nextMission = evalData.mission + 1
    if (paragraphLevelForMission(nextMission) > evalData.level) leveledUpThisSessionRef.current = true
    beginNextAttempt(nextMission)
  }

  function handleTryAgain(): void {
    if (evalData === null) return
    beginNextAttempt(evalData.mission)
  }

  function handlePracticeAgain(): void {
    clearTimer()
    onRestart()
  }

  // ── Mission Complete metrics ─────────────────────────────────────────
  const result = runtime.result

  const completedSummary = useMemo(() => {
    if (result === null) return null
    const progression = computePromotion({
      currentTier: tier,
      recentAccuracies: [result.metrics.accuracyPercent],
      averageReactionMs: result.metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: totalSessions,
    })
    const recovery = progression.shouldPromote
      ? { shouldRecover: false }
      : computeRecovery({
          currentTier: tier,
          recentAccuracies: [result.metrics.accuracyPercent],
          averageReactionMs: result.metrics.averageReactionTimeMs,
          consecutiveCompletions: totalSessions,
        })
    const nextTier = progression.shouldPromote ? increaseDifficulty(tier) : recovery.shouldRecover ? decreaseDifficulty(tier) : tier
    const nextMission = paragraphReadingStartingMission(nextTier)
    const flashXpEarned = computeFlashXp(result.metrics.performanceScore, result.metrics.totalCount)
    const wpm = computeParagraphSessionWpm(totalWordsReadRef.current, totalReadingMsRef.current)
    const comprehensionPercent = computeComprehensionPercent(sessionTypedResponsesRef.current)
    const meaningRecognition = computeMeaningRecognitionLabel(comprehensionPercent)
    const bestStreak = computeBestStreak(sessionResponsesRef.current)
    const missionsCompleted = highestMissionThisSession.current
    const levelCompleted = highestLevelThisSession.current
    const rhythm = computeMeaningBlockRhythm(result.metrics.accuracyPercent, missionRequirement.requiredPercent, leveledUpThisSessionRef.current)
    const achievement = computeTodaysAchievement({ leveledUpThisSession: leveledUpThisSessionRef.current, rhythm })
    const topicMastery = lastPassedTopicRef.current !== null
      ? computeTopicMastery(PARAGRAPH_TOPIC_NAME[lastPassedTopicRef.current as keyof typeof PARAGRAPH_TOPIC_NAME], passedAnyMissionThisSessionRef.current)
      : computeTopicMastery(PARAGRAPH_TOPIC_NAME[currentBlock?.paragraph.topic ?? 'human-brain'], false)

    return { promoted: progression.shouldPromote, recovered: recovery.shouldRecover, nextMission, flashXpEarned, wpm, comprehensionPercent, meaningRecognition, bestStreak, missionsCompleted, levelCompleted, rhythm, achievement, topicMastery }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, tier, totalSessions, missionRequirement.requiredPercent])

  let extraStats: RuntimeResultExtraStat[] = []
  let coachMessage = ''
  let extraContent: React.ReactNode = null

  if (result !== null && completedSummary !== null) {
    const recommendation = buildParagraphReadingRecommendation({
      accuracyPercent: result.metrics.accuracyPercent,
      rhythm: completedSummary.rhythm,
      paragraphDescriptor: levelParagraphDescriptor(completedSummary.levelCompleted),
      nextParagraphDescriptor: levelParagraphDescriptor(paragraphLevelForMission(completedSummary.nextMission)),
      promoted: completedSummary.promoted,
      recovered: completedSummary.recovered,
      seed: runtime.currentIndex + tier.length,
    })
    coachMessage = recommendation.coachParagraph

    // The brief's exact four Mission Complete headline fields — genuinely
    // distinct, honestly-computed values (see paragraphEngine.ts).
    extraStats = [
      { label: 'Reading Speed', value: `${completedSummary.wpm} WPM`, hint: 'Words per minute across every paragraph you actually read this session.' },
      { label: 'Comprehension', value: `${completedSummary.comprehensionPercent}%`, hint: 'Accuracy weighted toward deep-understanding questions like Main Idea and Inference.' },
      { label: 'Accuracy', value: `${result.metrics.accuracyPercent}%`, hint: 'The share of all Brain Challenge questions answered correctly.' },
      { label: 'Meaning Recognition', value: completedSummary.meaningRecognition, hint: 'How reliably you grasped each paragraph as one whole meaning block.' },
    ]

    extraContent = (
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="text-base tracking-widest text-foreground" aria-label={`${starRatingFromAccuracy(result.metrics.accuracyPercent)} rating`}>
          {starRatingFromAccuracy(result.metrics.accuracyPercent)}
        </p>
        <p>{completedSummary.achievement}</p>
        <p>Best Streak: <span className="font-medium text-foreground">{completedSummary.bestStreak}</span> · {completedSummary.topicMastery}</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {(runtime.phase === 'playing' || runtime.phase === 'paused') && (
        <MissionHud mission={currentMission} level={currentBlock?.level ?? paragraphLevelForMission(currentMission)} />
      )}

      <button
        onClick={() => { clearTimer(); router.push(getCurriculumSmartExitHref('paragraph-reading', LAB_HREF)) }}
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        aria-label="Exit exercise"
      >
        Exit
      </button>
      {runtime.phase === 'playing' && (
        <button
          onClick={runtime.pause}
          className="absolute top-4 right-20 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          aria-label="Pause exercise"
        >
          Pause
        </button>
      )}
      {runtime.phase === 'paused' && (
        <button
          onClick={runtime.resume}
          className="absolute top-4 right-20 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          aria-label="Resume exercise"
        >
          Resume
        </button>
      )}

      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        {runtime.phase === 'idle' && (
          <div className="flex w-full flex-col items-center gap-6 text-center">
            <ReadingJourney currentStage="paragraph" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Paragraph Reading™</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              Read a complete paragraph as one meaning block, then show what you understood — not what you memorized.
            </p>
            <dl className="grid w-full max-w-xs grid-cols-2 gap-x-4 gap-y-2 text-left text-xs">
              <dt className="text-muted-foreground">Mission</dt>
              <dd className="font-medium text-foreground">{startingMission} of {TOTAL_MISSIONS}</dd>
              <dt className="text-muted-foreground">Topic</dt>
              <dd className="font-medium text-foreground">{blocks[0] ? PARAGRAPH_TOPIC_NAME[blocks[0].paragraph.topic] : '—'}</dd>
              <dt className="text-muted-foreground">Difficulty</dt>
              <dd className="font-medium text-foreground" aria-hidden="true">{paragraphDifficultyStars(paragraphLevelForMission(startingMission))}</dd>
              <dt className="text-muted-foreground">Length</dt>
              <dd className="font-medium text-foreground">{PARAGRAPH_READING_LENGTH_LABEL[paragraphLevelForMission(startingMission)]}</dd>
            </dl>
            <p className="text-xs text-muted-foreground/70">
              Needs {getParagraphMissionRequirement(startingMission).requiredPercent}% correct{totalSessions > 0 ? ` · Session ${totalSessions + 1}` : ''}
            </p>
            <button
              onClick={runtime.startSession}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Begin Reading
            </button>
          </div>
        )}

        {runtime.phase === 'countdown' && (
          <ExerciseCountdown onComplete={runtime.beginPlaying} readyLabel="Mission Ready" goLabel="Begin Reading" />
        )}

        {runtime.phase === 'playing' && (
          <>
            {subPhase === 'passScreen' && evalData && !isVictoryRevealed && (
              <div className="flex min-h-[280px] flex-col items-center justify-center">
                <MicroVictoryMoment progressLabel={`Mission ${evalData.mission} of ${TOTAL_MISSIONS}`} />
              </div>
            )}
            {subPhase === 'passScreen' && evalData && isVictoryRevealed && (
              <div
                className={cn('flex min-h-[280px] flex-col items-center justify-center gap-3 text-center', !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-400')}
                role="status"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-success/10" aria-hidden="true">
                  <span className="text-2xl font-bold tabular-nums text-success">{Math.round(animatedPercent)}%</span>
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">Mission {evalData.mission} Complete</h2>
                <p className="text-sm font-medium text-muted-foreground">{computeMissionCoachLine(evalData.percent)}</p>
                <button
                  onClick={handleContinue}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {evalData.mission < TOTAL_MISSIONS ? 'Continue →' : 'View Results →'}
                </button>
              </div>
            )}
            {subPhase === 'failScreen' && evalData && (
              <div
                className={cn('flex min-h-[280px] flex-col items-center justify-center gap-3 text-center', !prefersReducedMotion && 'animate-in fade-in duration-300')}
                role="status"
              >
                <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(animatedPercent)}%</p>
                <p className="text-xs text-muted-foreground/70">Need {evalData.requiredPercent}%</p>
                <p className="mt-2 text-base font-semibold text-foreground">Read Once More</p>
                <p className="text-xs text-muted-foreground">{computeMissionCoachLine(evalData.percent)}</p>
                <button
                  onClick={handleTryAgain}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Retry →
                </button>
              </div>
            )}
            {subPhase === 'missionIntro' && currentBlock && (
              <div
                className={cn('flex min-h-[220px] w-full flex-col items-center justify-center gap-2 text-center', !prefersReducedMotion && 'animate-in fade-in duration-500')}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Mission {currentBlock.mission} of {TOTAL_MISSIONS}</p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{PARAGRAPH_TOPIC_NAME[currentBlock.paragraph.topic]}</p>
              </div>
            )}
            {subPhase === 'reading' && currentBlock && (
              <ParagraphReadingBlock
                key={currentBlockIndex}
                paragraph={currentBlock.paragraph}
                msPerWord={PARAGRAPH_READING_MS_PER_WORD[currentBlock.tier]}
                prefersReducedMotion={prefersReducedMotion}
                onComplete={handleReadingComplete}
              />
            )}
            {subPhase === 'pause' && (
              <div
                className={cn(
                  'flex min-h-[280px] w-full flex-col items-center justify-center gap-1.5 text-center',
                  !prefersReducedMotion && 'animate-in fade-in duration-200',
                )}
                aria-live="polite"
              >
                <p className="text-lg font-semibold tracking-tight text-foreground">Brain Challenge</p>
                <p className="text-xs text-muted-foreground">Show what you understood.</p>
              </div>
            )}
            {subPhase === 'question' && currentItem && currentChallenge && (
              <div className={cn('flex w-full flex-col items-center gap-4', !prefersReducedMotion && 'animate-in fade-in duration-300')}>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Brain Challenge · {currentQuestionIndex + 1} of {currentBlock?.questions.length ?? 8}
                </p>
                <ChoiceGrid
                  options={currentItem.options}
                  correctIndex={currentItem.correctIndex}
                  onSelect={handleSelect}
                  selectedIndex={questionSelectedIndex}
                  isFeedback={questionSubPhase === 'feedback'}
                  disabled={questionSubPhase !== 'response'}
                  promptLabel={currentChallenge.prompt}
                />
                <div className="h-5" aria-live="polite">
                  {questionSubPhase === 'feedback' && questionSelectedIndex !== null && (
                    <p className={cn(
                      'text-sm font-medium',
                      questionSelectedIndex === currentItem.correctIndex ? 'text-success' : 'text-muted-foreground',
                    )}>
                      {questionSelectedIndex === currentItem.correctIndex
                        ? POSITIVE_FEEDBACK_LINES[runtime.currentIndex % POSITIVE_FEEDBACK_LINES.length]
                        : KEEP_READING_LINE}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {runtime.phase === 'paused' && (
          <div className="flex w-full flex-col items-center gap-5 text-center">
            <p className="text-lg font-semibold text-foreground">Mission Paused</p>
            <p className="text-sm text-muted-foreground">
              Mission {currentMission} of {TOTAL_MISSIONS} · {runtime.runningAccuracy > 0 && `${runtime.runningAccuracy}% accuracy`}
            </p>
            <button
              onClick={runtime.resume}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Resume
            </button>
          </div>
        )}
      </div>

      {runtime.phase === 'completed' && result !== null && (
        <RuntimeResultScreen
          exerciseName={PARAGRAPH_READING_DEFINITION.title}
          trainsAbility={PARAGRAPH_READING_DEFINITION.trainsAbility}
          result={result}
          labHref={LAB_HREF}
          onPracticeAgain={handlePracticeAgain}
          extraStats={extraStats}
          coachMessage={coachMessage}
          extraContent={extraContent}
          labels={RESULT_LABELS}
          {...(isCurriculumSessionCurrentExercise('paragraph-reading')
            ? { onNext: () => router.push(getCurriculumSmartCompleteHref('paragraph-reading', LAB_HREF)) }
            : {})}
        />
      )}
    </div>
  )
}

// ── Outer component — session bookkeeping (tier, restart). Content
//    generation lives entirely inside the inner Session component, since
//    it happens reactively as missions are earned rather than all upfront.

type ParagraphReadingExperienceProps = {
  // Generated once per request by the Server Component in page.tsx — kept
  // stable across the SSR render and the client hydration render (see the
  // note on ParagraphReadingSession's `seed` prop).
  initialSeed: number
}

export function ParagraphReadingExperience({ initialSeed }: ParagraphReadingExperienceProps): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  const state = useMemo(
    () => loadState(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  function handleRestart(): void {
    setSessionKey((k) => k + 1)
  }

  return (
    <ParagraphReadingSession
      key={sessionKey}
      tier={state.currentDifficultyTier}
      totalSessions={state.sessionCount}
      onRestart={handleRestart}
      // Restarting is a client-only remount (no more SSR involved), so
      // mixing in sessionKey still gives every restart a fresh paragraph.
      seed={initialSeed + sessionKey * 999983}
    />
  )
}
