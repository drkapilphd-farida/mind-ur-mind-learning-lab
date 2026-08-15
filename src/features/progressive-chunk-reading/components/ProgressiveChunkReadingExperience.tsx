'use client'

// Progressive Chunk Reading™ Experience — Reading Intelligence Pack™'s
// flagship, production-locked mission. Structurally different from every
// Flash Pack mission: there is no flash-then-immediate-choice loop here.
// Chunks read automatically with zero interaction, then a single Brain
// Challenge tests retention of what was just read.
//
// This does NOT wrap UniversalExercisePlayer — that component hardcodes a
// per-item 'flash → response → feedback → gap' cycle with no passive mode
// (confirmed before this mission was first built). Instead this consumes
// the SAME `useUniversalExerciseRuntime` hook UniversalExercisePlayer
// itself uses internally, directly — session lifecycle, promotion/
// recovery, speed adaptation, Brain XP scoring, and the final
// RuntimeResult are all the exact same shared engine every mission runs
// on. Only the local, round-by-round orchestration is new, layered on
// top exactly the way UniversalExercisePlayer layers its own item-phase
// state on top of the same hook. The Universal Exercise Engine itself is
// untouched.
//
// The chunk auto-advance itself reuses useExercisePhaseTimer verbatim —
// the rAF-driven, tab-visibility-aware phase sequencer the Eye Foundation
// exercises already use — with each chunk modeled as one timed phase. No
// new timing engine was written.
//
// MASTERY-GATED LEVEL PROGRESSION, LOCKED SPEC — a level is a fixed
// number of reading rounds (one Brain Challenge each): 4/4/5/5/6 for
// Levels 1-5, passed only once 2/4, 3/4, 4/5, 4/5, or 5/6 of them
// (respectively) are answered correctly — a rising bar, not just rising
// content difficulty. Failing shows a minimal Fail screen with a
// [Try Again] button that retries the SAME level with fresh content.
// Passing shows a minimal Pass screen with a [Continue] button — the
// learner must click it; nothing auto-advances. Rounds are generated ONE
// AT A TIME, reactively: which tier/round comes next depends on whether
// the previous round's answer was correct and whether the level's full
// round count has been reached, which isn't knowable upfront.
//
// This could not be built as a single fixed-length `items` array handed
// to useUniversalExerciseRuntime once at session start (how every other
// mission works). Instead, `items` is DERIVED from a growing `blocks`
// state array, and each new round's question is appended to it only once
// the learner's path actually calls for it — whether that's "one more
// round in this attempt," "retry this level," or "advance to the next
// level." This is still the same, unmodified useUniversalExerciseRuntime
// — it already recomputes totalItems from whatever `items` currently is
// on every render and never assumes a frozen final length, so a
// genuinely growing items array works correctly with zero changes to
// that shared hook. The one piece of care this requires: recording a
// response (`runtime.recordResponse`) must use a closure that has
// already seen a newly-grown `items` — calling it in the same tick as
// the state update that grows `blocks` would still use the stale
// closure, so growth and recordResponse are deliberately sequenced one
// render apart (see pendingResponseRef below). For the one true ending
// (Level 5 passed), `blocks` never grows again and the response is
// recorded directly, letting the runtime complete the session normally.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { ChoiceGrid } from '@/components/exercise-engine/ChoiceGrid'
import { RuntimeResultScreen, type RuntimeResultExtraStat, type RuntimeResultLabels } from '@/components/exercise-engine/RuntimeResultScreen'
import { FitText } from '@/components/typography/FitText'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { useExercisePhaseTimer, type PhaseConfig } from '@/hooks/exercises/useExercisePhaseTimer'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { useUniversalExerciseRuntime } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { getContentForExercise, getContentFromPool } from '@/lib/exercise-engine/datasetEngine'
import { pickItems } from '@/lib/exercise-engine/randomizationEngine'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import type { ItemResponse, DifficultyTier, ContentType, ContentItem, ExerciseDefinition } from '@/types/exercise-engine'
import { PROGRESSIVE_CHUNK_READING_DEFINITION } from '../definitions/progressiveChunkReadingDefinition'
import {
  getProgressiveChunkReadingProfile,
  getProgressiveChunkReadingLevelRequirement,
  progressiveChunkReadingLevel,
  progressiveChunkReadingQuestionPrompt,
  progressiveChunkReadingPassPercent,
  progressiveChunkReadingChunksForRound,
  PROGRESSIVE_CHUNK_READING_LEVEL_NAME,
  PROGRESSIVE_CHUNK_READING_CHUNK_SIZE_LABEL,
  PROGRESSIVE_CHUNK_READING_DIFFICULTY_STARS,
  PROGRESSIVE_CHUNK_READING_TYPOGRAPHY_ROLE,
  PROGRESSIVE_CHUNK_READING_LEVEL_DEFAULT_TIER,
  type ProgressiveChunkReadingLevel,
} from '../progressiveChunkReadingDifficulty'
import {
  buildProgressiveChunkReadingBlock,
  computeLevelPassed,
  computeReadingRhythm,
  computeSessionWpm,
  computeWpmImprovement,
  totalWordsInBlocks,
  type ProgressiveChunkReadingBlock,
} from '../progressiveChunkReadingEngine'
import {
  appendProgressiveChunkReadingSession,
  computeProgressiveChunkReadingAnalytics,
  getRecentlyShownStimuli,
} from '../progressiveChunkReadingHistory'
import {
  buildProgressiveChunkReadingRecommendation,
  computeReadingReadiness,
  computeBrainPerformanceLabel,
  computeBrainFocusLabel,
  computeTodaysAchievement,
  computeLevelCoachLine,
} from '../progressiveChunkReadingRecommendation'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'
// Reused, read-only, from Word Flash — same precedent every Flash Pack
// mission already established for this exact function.
import { computeFlashXp } from '../../flash-intelligence/wordFlashEngine'

// Register both source datasets. Levels 1-3 need chunkDataset.ts; Levels
// 4-5 need phraseDataset.ts too. Registering both unconditionally avoids
// the exact "empty pool because a dataset wasn't imported yet" bug found
// and fixed in Mixed Flash.
import '../../chunk-reading/chunkDataset'
import '../../phrase-reading/phraseDataset'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'

const EXERCISE_ID = 'progressive-chunk-reading'
const LAB_HREF = '/labs/quantum-speed-reading'
const NEXT_MISSION_HREF = '/labs/quantum-speed-reading/phrase-reading'
const NEXT_MISSION_ID = 'phrase-reading'
const NEXT_MISSION_NAME = 'Phrase Reading™'

const FEEDBACK_MS = 450
const MIN_CHUNK_DISPLAY_MS = 500
const MIN_CHUNK_DISPLAY_MS_REDUCED_MOTION = 900
const POOL_FETCH_COUNT = 24 // matches the real curated supply per tier (see chunkDataset.ts / phraseDataset.ts)

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Chunk Recognition Strengthened',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Reading Pace',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Avg Response Time',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Next Mission →',
}

function wordCountOf(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function levelChunkDescriptor(level: ProgressiveChunkReadingLevel): string {
  if (level === 1) return '2-word chunks'
  if (level === 2) return '3-word chunks'
  if (level === 3) return '4-word chunks'
  if (level === 4) return 'natural reading phrases'
  return 'adaptive mixed content'
}

// ── Reading Flow — chunks presented automatically, zero interaction ───────
// Reuses useExercisePhaseTimer directly: each chunk is one timed phase.

function ReadingFlowBlock({
  chunks,
  phases,
  typographyRole,
  prefersReducedMotion,
  onComplete,
}: {
  chunks: string[]
  phases: PhaseConfig<string>[]
  typographyRole: 'reading-1' | 'reading-2' | 'reading-3' | 'reading-4' | 'reading-5'
  prefersReducedMotion: boolean
  onComplete: () => void
}): React.JSX.Element {
  const timer = useExercisePhaseTimer(phases, onComplete)
  const currentIndex = Number(timer.phaseId)
  const currentChunk = chunks[currentIndex] ?? chunks[chunks.length - 1] ?? ''

  return (
    <div
      className="flex min-h-[220px] w-full flex-col items-center justify-center gap-8"
      style={{ opacity: timer.boundaryOpacity }}
    >
      <div
        key={timer.phaseId}
        className={cn('w-full', !prefersReducedMotion && 'animate-in fade-in duration-300')}
        aria-live="polite"
        aria-label={currentChunk}
      >
        <FitText
          text={currentChunk}
          role={typographyRole}
          className="select-none text-center font-semibold text-foreground"
        />
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {chunks.map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-1.5 rounded-full',
              !prefersReducedMotion && 'transition-colors duration-200',
              i <= currentIndex ? 'bg-foreground/50' : 'bg-muted-foreground/20',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Level Map — "always show" per the locked spec: ✔──●──○──○──○ / L1..L5

function LevelMap({ currentLevel }: { currentLevel: ProgressiveChunkReadingLevel }): React.JSX.Element {
  const levels: ProgressiveChunkReadingLevel[] = [1, 2, 3, 4, 5]
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Level map: currently on Level ${currentLevel} of 5`}>
      <div className="flex items-center">
        {levels.map((level, i) => (
          <div key={level} className="flex items-center">
            {i > 0 && <div className="h-px w-3 bg-border" aria-hidden="true" />}
            <span
              className={cn(
                'text-xs',
                level < currentLevel ? 'text-success' : level === currentLevel ? 'font-bold text-foreground' : 'text-muted-foreground/40',
              )}
              aria-hidden="true"
            >
              {level < currentLevel ? '✔' : level === currentLevel ? '●' : '○'}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center text-[9px] text-muted-foreground/60">
        {levels.map((level, i) => (
          <span key={level} className={cn('w-3 text-center', i > 0 && 'ml-3')}>L{level}</span>
        ))}
      </div>
    </div>
  )
}

// ── Persistent HUD — always visible during 'playing'.

function LevelHud({
  missionNumber,
  level,
  brainFocus,
  prefersReducedMotion,
}: {
  missionNumber: number
  level: ProgressiveChunkReadingLevel
  brainFocus: string
  prefersReducedMotion: boolean
}): React.JSX.Element {
  return (
    <div className="absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-center">
      <p className="text-xs font-medium tabular-nums text-muted-foreground">
        Mission {missionNumber} • Level {level}
      </p>
      <LevelMap currentLevel={level} />
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
        <span>Chunk Size: <span className="font-medium text-foreground/80">{PROGRESSIVE_CHUNK_READING_CHUNK_SIZE_LABEL[level]}</span></span>
        <span aria-hidden="true">{PROGRESSIVE_CHUNK_READING_DIFFICULTY_STARS[level]}</span>
      </div>
      <p className={cn('text-[10px] text-muted-foreground/60', !prefersReducedMotion && 'transition-opacity duration-200')}>
        Brain Focus: <span className="font-medium text-foreground/70">{brainFocus}</span>
      </p>
    </div>
  )
}

// ── Session — everything that lives between Mission Ready and Mission
//    Complete. A fresh instance per session (keyed by sessionKey in the
//    parent), exactly mirroring how UniversalExercisePlayer is remounted
//    per session in every other mission.

type QuestionSubPhase = 'response' | 'feedback'
type SessionSubPhase = 'reading' | 'question' | 'passScreen' | 'failScreen'

type EvalData = {
  level: ProgressiveChunkReadingLevel
  correctCount: number
  totalCount: number
  percent: number
  requiredPercent: number
  passed: boolean
}

function ProgressiveChunkReadingSession({
  tier,
  analytics,
  onRestart,
  seed,
  definition,
  contentPool,
  exitHref,
  onComplete,
}: {
  tier: DifficultyTier
  analytics: ReturnType<typeof computeProgressiveChunkReadingAnalytics>
  onRestart: () => void
  seed: number
  // Sprint QSR-2.6 — Quantum Experience Parity™. Every field below is
  // optional and defaults to exactly today's standalone behavior — the
  // real mission, parameterized rather than forked, so a caller (the
  // Quantum Reading Journey) can supply its own exercise identity,
  // document-derived content pool, exit destination, and completion
  // callback without this component knowing anything about the Journey.
  definition?: ExerciseDefinition
  contentPool?: readonly ContentItem[]
  exitHref?: string
  // Sprint: also passes the real, honestly-measured estimatedWpm (total
  // words shown / total scripted reading time) alongside the shared
  // RuntimeResult — that number is otherwise only ever rendered locally
  // (in extraContent below), never exposed to a caller. Additive: any
  // existing caller supplying a single-argument `(result) => void`
  // continues to type-check and behave identically (a function is always
  // assignable where more parameters than it declares are expected).
  onComplete?: (result: RuntimeResult, estimatedWpm: number) => void
}): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('progressive-chunk-reading', LAB_HREF)
  const resolvedDefinition = definition ?? PROGRESSIVE_CHUNK_READING_DEFINITION
  const resolvedExitHref = exitHref ?? LAB_HREF
  const exerciseId = resolvedDefinition.id
  const startingLevel = progressiveChunkReadingLevel(tier)
  const startingProfile = getProgressiveChunkReadingProfile(tier)

  // ── On-demand round generation — one round at a time, reactively ──────
  // `seed` is server-generated (see page.tsx) and passed down as a prop so
  // the very first render is identical between SSR and hydration — a bare
  // `Date.now()` here previously ticked between the server render and the
  // client's hydration render, causing a hydration-mismatch crash.
  const sessionSeedRef = useRef(seed)
  const roundGenerationCountRef = useRef(0)
  const usedChunksByKeyRef = useRef(new Map<string, Set<string>>())
  const recentlyShownRef = useRef<Set<string> | null>(null)
  if (recentlyShownRef.current === null) recentlyShownRef.current = getRecentlyShownStimuli(exerciseId)

  const fetchRoundForLevel = useCallback((level: ProgressiveChunkReadingLevel, roundIndexInLevel: number): ProgressiveChunkReadingBlock | null => {
    const roundTier = PROGRESSIVE_CHUNK_READING_LEVEL_DEFAULT_TIER[level]
    const roundProfile = getProgressiveChunkReadingProfile(roundTier)
    const genSeed = sessionSeedRef.current + roundGenerationCountRef.current * 104729
    roundGenerationCountRef.current += 1

    const contentTypes = roundProfile.contentTypes
    // Sprint QSR-2.6 — Quantum Experience Parity™. A document-derived pool
    // only ever contains chunk-typed content (the Exercise Asset Builder
    // produces no 'reading-phrase' assets) — Levels 4-5's 'reading-phrase'
    // profile gracefully degrades to 'chunk' instead of fabricating phrase
    // content or building a new asset type.
    const contentType: ContentType = contentPool !== undefined
      ? 'chunk'
      : contentTypes.length <= 1
        ? contentTypes[0]!
        : (pickItems([...contentTypes], 1, genSeed)[0] ?? contentTypes[0]!)

    const chunksThisRound = progressiveChunkReadingChunksForRound(roundIndexInLevel)
    const key = `${roundTier}:${contentType}`
    const usedThisTier = usedChunksByKeyRef.current.get(key) ?? new Set<string>()

    const fullPool = contentPool !== undefined
      ? getContentFromPool(contentPool, { difficulty: roundTier, count: Math.max(chunksThisRound, POOL_FETCH_COUNT), seed: genSeed })
      : getContentForExercise({
          contentType,
          locale: 'en',
          difficulty: roundTier,
          count: Math.max(chunksThisRound, POOL_FETCH_COUNT),
          seed: genSeed,
        })
    const recentlyShown = recentlyShownRef.current ?? new Set<string>()
    const excludeSet = new Set([...usedThisTier, ...[...recentlyShown].filter((c) => fullPool.some((i) => i.content === c))])

    const round = buildProgressiveChunkReadingBlock(
      { tier: roundTier, contentType, pool: fullPool },
      chunksThisRound,
      1,
      genSeed,
      excludeSet,
    )
    if (round !== null) {
      for (const chunk of round.chunks) usedThisTier.add(chunk)
      usedChunksByKeyRef.current.set(key, usedThisTier)
    }
    return round
  }, [contentPool])

  const [blocks, setBlocks] = useState<ProgressiveChunkReadingBlock[]>(() => {
    const first = fetchRoundForLevel(startingLevel, 0)
    return first ? [first] : []
  })
  const [currentLevel, setCurrentLevel] = useState<ProgressiveChunkReadingLevel>(startingLevel)

  const highestLevelThisSession = useRef<ProgressiveChunkReadingLevel>(startingLevel)

  const { items, itemToBlockIndex } = useMemo(() => {
    const flatItems = blocks.flatMap((b) => b.questions)
    const mapping: number[] = []
    blocks.forEach((block, blockIdx) => {
      for (let i = 0; i < block.questions.length; i++) mapping.push(blockIdx)
    })
    return { items: flatItems, itemToBlockIndex: mapping }
  }, [blocks])

  const onSessionComplete = useCallback(async (result: RuntimeResult): Promise<void> => {
    await savePracticeSession({
      labId: resolvedDefinition.labId,
      exerciseId: resolvedDefinition.id,
      durationMs: Math.max(1, result.metrics.sessionDurationMs),
      completed: result.metrics.accuracyPercent >= resolvedDefinition.adaptiveRules.minAccuracyToComplete,
    })
  }, [resolvedDefinition])

  const runtime = useUniversalExerciseRuntime({
    definition: resolvedDefinition,
    items,
    nextExerciseId: NEXT_MISSION_ID,
    nextExerciseHref: NEXT_MISSION_HREF,
    onSessionComplete,
  })

  const floorMs = prefersReducedMotion ? MIN_CHUNK_DISPLAY_MS_REDUCED_MOTION : MIN_CHUNK_DISPLAY_MS

  const [subPhase, setSubPhase] = useState<SessionSubPhase>('reading')
  const [questionSelectedIndex, setQuestionSelectedIndex] = useState<number | null>(null)
  const [questionSubPhase, setQuestionSubPhase] = useState<QuestionSubPhase>('response')
  const [evalData, setEvalData] = useState<EvalData | null>(null)
  const isVictoryRevealed = useMicroVictoryReveal(1500, evalData?.level)
  // Sprint-16 — Delight Layer™. The pass/fail screen's percentage used to
  // snap straight to its final value; now it ticks up like every other
  // result number in the app. The coaching line stays keyed to the raw
  // evalData.percent (see below), never the in-flight animated value.
  const animatedPercent = useCountUp(evalData?.percent ?? 0, 700, prefersReducedMotion)
  const animatedCorrectCount = useCountUp(evalData?.correctCount ?? 0, 700, prefersReducedMotion)
  const questionStartTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptResponsesRef = useRef<ItemResponse[]>([])
  const roundIndexInLevelRef = useRef(0)
  const blockAccuracyHistoryRef = useRef<number[]>([])
  const leveledUpThisSessionRef = useRef(false)

  // A response answered on the LAST round of a level attempt is held here
  // until the learner clicks Continue/Try Again — it must not be recorded
  // (or grow `items`) automatically, per "Never auto-enter the next
  // level." The actual growth + deferred recording happens in
  // handleContinue/handleTryAgain below.
  const pendingEvalResponseRef = useRef<ItemResponse | null>(null)

  // Growing `items` mid-session means `runtime.recordResponse` must be
  // called with a closure that has already seen the new, longer array —
  // calling it in the same tick as the setBlocks() that grows it would
  // still use the stale (shorter) closure. Recording is deferred exactly
  // one render, via this ref + a version counter that forces the effect
  // below to re-run once the growth has landed.
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
  const currentBlockProfile = currentBlock ? getProgressiveChunkReadingProfile(currentBlock.tier) : startingProfile
  const currentItem = items[runtime.currentIndex] ?? null
  const levelRequirement = getProgressiveChunkReadingLevelRequirement(currentLevel)

  const brainFocus = computeBrainFocusLabel(blockAccuracyHistoryRef.current)

  const readingPhases: PhaseConfig<string>[] = useMemo(() => {
    if (!currentBlock) return []
    return currentBlock.chunks.map((chunk, i) => ({
      id: String(i),
      durationMs: Math.max(floorMs, wordCountOf(chunk) * currentBlockProfile.msPerWord),
    }))
  }, [currentBlock, currentBlockProfile.msPerWord, floorMs])

  const handleReadingComplete = useCallback((): void => {
    setSubPhase('question')
    questionStartTimeRef.current = Date.now()
  }, [])

  function handleSelect(idx: number): void {
    if (questionSubPhase !== 'response' || !currentItem) return
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

    clearTimer()
    timerRef.current = setTimeout(() => {
      setQuestionSelectedIndex(null)
      setQuestionSubPhase('response')

      attemptResponsesRef.current.push(response)
      roundIndexInLevelRef.current += 1
      const isLastRoundOfAttempt = roundIndexInLevelRef.current >= levelRequirement.challengesRequired

      if (!isLastRoundOfAttempt) {
        // More rounds needed before this level attempt can be evaluated —
        // keep reading, uninterrupted, exactly like the locked Session
        // Flow ("20 chunks → Challenge → 10 more chunks → Challenge →
        // ... → Evaluate").
        const nextRound = fetchRoundForLevel(currentLevel, roundIndexInLevelRef.current)
        if (nextRound !== null) {
          pendingResponseRef.current = response
          setBlocks((prev) => [...prev, nextRound])
          setPendingResponseVersion((v) => v + 1)
          setSubPhase('reading')
        } else {
          // Pool exhausted — never fabricate; end gracefully here.
          runtime.recordResponse(response)
        }
      } else {
        // Last round of this attempt — evaluate, but do NOT record the
        // response or grow `blocks` yet. The Pass/Fail screen waits for
        // an explicit Continue/Try Again click before anything happens.
        const correctCount = attemptResponsesRef.current.filter((r) => r.isCorrect).length
        const totalCount = attemptResponsesRef.current.length
        const passed = computeLevelPassed(correctCount, levelRequirement.passCount)
        blockAccuracyHistoryRef.current.push(Math.round((correctCount / totalCount) * 100))
        pendingEvalResponseRef.current = response
        setEvalData({
          level: currentLevel,
          correctCount,
          totalCount,
          percent: Math.round((correctCount / totalCount) * 100),
          requiredPercent: progressiveChunkReadingPassPercent(currentLevel),
          passed,
        })
        setSubPhase(passed ? 'passScreen' : 'failScreen')
      }
    }, FEEDBACK_MS)
  }

  function beginNextAttempt(level: ProgressiveChunkReadingLevel): void {
    const response = pendingEvalResponseRef.current
    if (response === null) return
    pendingEvalResponseRef.current = null

    const firstRound = fetchRoundForLevel(level, 0)
    if (firstRound === null) {
      // Pool exhausted — never fabricate; end gracefully here.
      runtime.recordResponse(response)
      return
    }

    setCurrentLevel(level)
    if (level > highestLevelThisSession.current) highestLevelThisSession.current = level
    attemptResponsesRef.current = []
    roundIndexInLevelRef.current = 0
    setEvalData(null)

    pendingResponseRef.current = response
    setBlocks((prev) => [...prev, firstRound])
    setPendingResponseVersion((v) => v + 1)
    setSubPhase('reading')
  }

  function handleContinue(): void {
    if (evalData === null) return
    if (evalData.level >= 5) {
      // Level 5 passed — nothing left to unlock. This is the one true
      // ending: `blocks` never grows again, so the response can be
      // recorded directly with the current (already-correct) closure.
      const response = pendingEvalResponseRef.current
      pendingEvalResponseRef.current = null
      if (response !== null) runtime.recordResponse(response)
      return
    }
    leveledUpThisSessionRef.current = true
    beginNextAttempt((evalData.level + 1) as ProgressiveChunkReadingLevel)
  }

  function handleTryAgain(): void {
    if (evalData === null) return
    beginNextAttempt(evalData.level)
  }

  function handlePracticeAgain(): void {
    clearTimer()
    onRestart()
  }

  // ── Mission Complete metrics ─────────────────────────────────────────
  const totalWords = useMemo(() => totalWordsInBlocks(blocks), [blocks])
  const totalReadingTimeMs = useMemo(
    () => blocks.reduce((sum, block) => {
      const blockProfile = getProgressiveChunkReadingProfile(block.tier)
      return sum + block.chunks.reduce((s, c) => s + Math.max(floorMs, wordCountOf(c) * blockProfile.msPerWord), 0)
    }, 0),
    [blocks, floorMs],
  )
  const estimatedWpm = computeSessionWpm(totalWords, totalReadingTimeMs)
  const result = runtime.result

  // Derived once per completed result — shared by the display values below
  // and the persistence effect, rather than recomputed twice.
  const completedSummary = useMemo(() => {
    if (result === null) return null
    const readingRhythm = computeReadingRhythm(
      result.metrics.accuracyPercent,
      startingProfile.requiredAccuracyToAdvance,
      analytics.previousEstimatedWpm === null ? null : estimatedWpm > analytics.previousEstimatedWpm,
    )
    const progression = computePromotion({
      currentTier: tier,
      recentAccuracies: [result.metrics.accuracyPercent],
      averageReactionMs: result.metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: analytics.totalSessions,
    })
    const recovery = progression.shouldPromote
      ? { shouldRecover: false }
      : computeRecovery({
          currentTier: tier,
          recentAccuracies: [result.metrics.accuracyPercent],
          averageReactionMs: result.metrics.averageReactionTimeMs,
          consecutiveCompletions: analytics.totalSessions,
        })
    const nextTier = progression.shouldPromote ? increaseDifficulty(tier) : recovery.shouldRecover ? decreaseDifficulty(tier) : tier
    const nextLevel = progressiveChunkReadingLevel(nextTier)
    const wpmImprovement = computeWpmImprovement(
      estimatedWpm,
      analytics.previousEstimatedWpm,
      result.metrics.accuracyPercent,
      startingProfile.requiredAccuracyToAdvance,
    )
    const flashXpEarned = computeFlashXp(result.metrics.performanceScore, result.metrics.totalCount)
    const readiness = computeReadingReadiness(result.metrics.accuracyPercent, startingProfile.requiredAccuracyToAdvance)
    const brainPerformance = computeBrainPerformanceLabel(result.metrics.accuracyPercent, readingRhythm)
    const levelsCompleted = Math.max(highestLevelThisSession.current, analytics.highestLevelEverReached ?? 0) as ProgressiveChunkReadingLevel
    const todaysAchievement = computeTodaysAchievement({ leveledUpThisSession: leveledUpThisSessionRef.current, readingRhythm })

    return {
      readingRhythm, promoted: progression.shouldPromote, recovered: recovery.shouldRecover, nextLevel,
      wpmImprovement, flashXpEarned, readiness, brainPerformance, levelsCompleted, todaysAchievement,
    }
  }, [result, tier, startingProfile.requiredAccuracyToAdvance, analytics.previousEstimatedWpm, analytics.totalSessions, analytics.highestLevelEverReached, estimatedWpm])

  let extraStats: RuntimeResultExtraStat[] = []
  let coachMessage = ''
  let extraContent: React.ReactNode = null

  if (result !== null && completedSummary !== null) {
    const recommendation = buildProgressiveChunkReadingRecommendation({
      accuracyPercent: result.metrics.accuracyPercent,
      readingRhythm: completedSummary.readingRhythm,
      chunkDescriptor: levelChunkDescriptor(highestLevelThisSession.current),
      nextChunkDescriptor: levelChunkDescriptor(completedSummary.nextLevel),
      promoted: completedSummary.promoted,
      recovered: completedSummary.recovered,
      seed: runtime.currentIndex + tier.length,
    })
    coachMessage = recommendation.coachParagraph

    extraStats = [
      { label: 'Levels Completed', value: `${completedSummary.levelsCompleted} / 5`, hint: 'The highest level you have reached in Progressive Chunk Reading, including today.' },
      { label: 'Highest Chunk Size', value: PROGRESSIVE_CHUNK_READING_CHUNK_SIZE_LABEL[highestLevelThisSession.current], hint: 'The largest chunk size you read this session.' },
      { label: 'Brain Performance', value: completedSummary.brainPerformance, hint: 'Blends recognition accuracy with whether your reading pace increased.' },
      {
        label: 'Estimated Reading Speed Gain',
        value: completedSummary.wpmImprovement === null ? 'Establishing baseline' : `${completedSummary.wpmImprovement >= 0 ? '+' : ''}${completedSummary.wpmImprovement} WPM`,
        hint: 'A real measurement — total words shown divided by total reading time — compared with your last session.',
      },
    ]

    extraContent = (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Today&apos;s Achievement: <span className="font-medium text-foreground">{completedSummary.todaysAchievement}</span></p>
        <p>Estimated WPM: <span className="font-medium text-foreground">{estimatedWpm}</span></p>
        <p>Next Level: <span className="font-medium text-foreground">{PROGRESSIVE_CHUNK_READING_LEVEL_NAME[completedSummary.nextLevel]}</span></p>
        <p>Reading Readiness: <span className="font-medium text-foreground">{completedSummary.readiness}</span></p>
        {onComplete === undefined && <p>Next Mission: <span className="font-medium text-foreground">{NEXT_MISSION_NAME}</span></p>}
      </div>
    )
  }

  // Persist exactly once per completed session — an effect, not inline
  // render logic, so this never fires during render (the same
  // setState/localStorage-during-render class of issue found and
  // disclosed in Peripheral Flash's polish sprint).
  const notifiedResultRef = useRef<RuntimeResult | null>(null)
  useEffect(() => {
    if (result === null || completedSummary === null || notifiedResultRef.current === result) return
    notifiedResultRef.current = result
    const stimuli = blocks.flatMap((b) => b.chunks)
    appendProgressiveChunkReadingSession(exerciseId, {
      timestamp: Date.now(),
      tier,
      blocksCompleted: blocks.length,
      chunksRead: blocks.reduce((s, b) => s + b.chunks.length, 0),
      recognitionAccuracyPercent: result.metrics.accuracyPercent,
      estimatedWpm,
      readingRhythm: completedSummary.readingRhythm,
      highestLevelReached: highestLevelThisSession.current,
      promoted: completedSummary.promoted,
      recovered: completedSummary.recovered,
      stimuli,
    })
  }, [result, completedSummary, blocks, tier, estimatedWpm, exerciseId])

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {(runtime.phase === 'playing' || runtime.phase === 'paused') && (
        <LevelHud
          missionNumber={analytics.totalSessions + 1}
          level={currentLevel}
          brainFocus={brainFocus}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      <button
        onClick={() => { clearTimer(); router.push(getCurriculumSmartExitHref('progressive-chunk-reading', resolvedExitHref)) }}
        className="absolute top-4 right-6 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Exit exercise"
      >
        Exit
      </button>
      {runtime.phase === 'playing' && (
        <button
          onClick={runtime.pause}
          className="absolute top-4 right-20 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Pause exercise"
        >
          Pause
        </button>
      )}
      {runtime.phase === 'paused' && (
        <button
          onClick={runtime.resume}
          className="absolute top-4 right-20 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Resume exercise"
        >
          Resume
        </button>
      )}

      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        {runtime.phase === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Progressive Chunk Reading™</h1>
            <p className="text-sm font-medium text-muted-foreground">See Groups, Not Single Words</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Train your eyes to read multiple words as one visual chunk instead of one at a time.
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Pass each level to unlock the next — starting at {PROGRESSIVE_CHUNK_READING_LEVEL_NAME[startingLevel]}.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Level {startingLevel} needs {getProgressiveChunkReadingLevelRequirement(startingLevel).passCount} of {getProgressiveChunkReadingLevelRequirement(startingLevel).challengesRequired} Brain Challenges correct{analytics.totalSessions > 0 ? ` · Mission ${analytics.totalSessions + 1}` : ''}
            </p>
            <button
              onClick={runtime.startSession}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
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
                <MicroVictoryMoment progressLabel={`Level ${evalData.level} of 5`} />
              </div>
            )}
            {subPhase === 'passScreen' && evalData && isVictoryRevealed && (
              <div
                className={cn('flex min-h-[280px] flex-col items-center justify-center gap-3 text-center', !prefersReducedMotion && 'animate-in fade-in duration-300')}
                role="status"
              >
                <h2 className="text-xl font-bold text-foreground">Level {evalData.level} Complete</h2>
                <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(animatedCorrectCount)} / {evalData.totalCount}</p>
                <p className="text-sm tabular-nums text-success">{Math.round(animatedPercent)}%</p>
                <p className="text-sm font-medium text-muted-foreground">{computeLevelCoachLine(evalData.percent)}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {evalData.level < 5 ? `🔓 Level ${evalData.level + 1}` : '🏆 All Levels Complete'}
                </p>
                <button
                  onClick={handleContinue}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
                >
                  {evalData.level < 5 ? 'Continue to Next Level' : 'View Results'}
                </button>
              </div>
            )}
            {subPhase === 'failScreen' && evalData && (
              <div
                className={cn('flex min-h-[280px] flex-col items-center justify-center gap-3 text-center', !prefersReducedMotion && 'animate-in fade-in duration-300')}
                role="status"
              >
                <h2 className="text-xl font-bold text-foreground">Level {evalData.level}</h2>
                <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(animatedCorrectCount)} / {evalData.totalCount}</p>
                <p className="text-sm tabular-nums text-muted-foreground">{Math.round(animatedPercent)}%</p>
                <p className="text-xs text-muted-foreground/70">Need {evalData.requiredPercent}%</p>
                <p className="text-xs text-muted-foreground">{computeLevelCoachLine(evalData.percent)}</p>
                {evalData.level < 5 && (
                  <p className="mt-2 text-sm font-medium text-muted-foreground">🔒 Level {evalData.level + 1}</p>
                )}
                <button
                  onClick={handleTryAgain}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
                >
                  Try Again
                </button>
              </div>
            )}
            {subPhase === 'reading' && currentBlock && (
              <ReadingFlowBlock
                key={currentBlockIndex}
                chunks={currentBlock.chunks}
                phases={readingPhases}
                typographyRole={PROGRESSIVE_CHUNK_READING_TYPOGRAPHY_ROLE[currentLevel]}
                prefersReducedMotion={prefersReducedMotion}
                onComplete={handleReadingComplete}
              />
            )}
            {subPhase === 'question' && currentItem && (
              <div className="flex w-full flex-col items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground" aria-hidden="true">🧠 Brain Challenge</p>
                <ChoiceGrid
                  options={currentItem.options}
                  correctIndex={currentItem.correctIndex}
                  onSelect={handleSelect}
                  selectedIndex={questionSelectedIndex}
                  isFeedback={questionSubPhase === 'feedback'}
                  disabled={questionSubPhase !== 'response'}
                  promptLabel={progressiveChunkReadingQuestionPrompt(currentBlockProfile.tier, currentBlockIndex * 7 + runtime.currentIndex)}
                />
              </div>
            )}
          </>
        )}

        {runtime.phase === 'paused' && (
          <div className="flex flex-col items-center gap-5 text-center w-full">
            <p className="text-lg font-semibold text-foreground">Mission Paused</p>
            <p className="text-sm text-muted-foreground">
              Level {currentLevel} of 5 · {runtime.runningAccuracy > 0 && `${runtime.runningAccuracy}% accuracy`}
            </p>
            <button
              onClick={runtime.resume}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background"
            >
              Resume
            </button>
          </div>
        )}
      </div>

      {runtime.phase === 'completed' && result !== null && (
        <RuntimeResultScreen
          exerciseName={resolvedDefinition.title}
          trainsAbility={resolvedDefinition.trainsAbility}
          result={result}
          labHref={getWizardAwareBackHref('progressive-chunk-reading', resolvedExitHref)}
          onPracticeAgain={handlePracticeAgain}
          extraStats={extraStats}
          coachMessage={coachMessage}
          extraContent={extraContent}
          labels={RESULT_LABELS}
          {...(curriculumSession.isActiveStep
            ? { onNext: curriculumSession.advance }
            : onComplete !== undefined
              ? { onNext: () => onComplete(result, estimatedWpm) }
              : {})}
        />
      )}
    </div>
  )
}

// ── Outer component — session bookkeeping (tier, analytics, restart),
//    mirrors every other mission's Experience.tsx split. Content
//    generation itself lives entirely inside the inner Session component,
//    since it happens reactively as levels are earned rather than all
//    upfront.

type ProgressiveChunkReadingExperienceProps = {
  // Generated once per request by the Server Component in page.tsx — kept
  // stable across the SSR render and the client hydration render.
  initialSeed: number
  // Sprint QSR-2.6 — Quantum Experience Parity™. Optional, additive, all
  // defaulting to exactly today's standalone behavior — see the same
  // fields on ProgressiveChunkReadingSession's own props above.
  definition?: ExerciseDefinition
  contentPool?: readonly ContentItem[]
  exitHref?: string
  onComplete?: (result: RuntimeResult, estimatedWpm: number) => void
}

export function ProgressiveChunkReadingExperience({ initialSeed, definition, contentPool, exitHref, onComplete }: ProgressiveChunkReadingExperienceProps): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const exerciseId = definition?.id ?? EXERCISE_ID

  const state = useMemo(
    () => loadState(exerciseId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, exerciseId],
  )

  const analytics = useMemo(
    () => computeProgressiveChunkReadingAnalytics(exerciseId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, exerciseId],
  )

  function handleRestart(): void {
    setSessionKey((k) => k + 1)
  }

  return (
    <ProgressiveChunkReadingSession
      key={sessionKey}
      tier={state.currentDifficultyTier}
      analytics={analytics}
      onRestart={handleRestart}
      seed={initialSeed + sessionKey * 999983}
      {...(definition !== undefined ? { definition } : {})}
      {...(contentPool !== undefined ? { contentPool } : {})}
      {...(exitHref !== undefined ? { exitHref } : {})}
      {...(onComplete !== undefined ? { onComplete } : {})}
    />
  )
}
