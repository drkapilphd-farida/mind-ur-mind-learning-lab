'use client'

// Phrase Reading™ Experience — Reading Intelligence Pack™'s Mission 2.
// Architecturally identical to Progressive Chunk Reading™ (PCR): Mission →
// Level → Practice → Brain Challenge → Pass/Retry → Continue → Next Level →
// Mission Complete, growable `items`, the deferred-response-after-growth
// pattern, a Level Map, exact-microcopy Pass/Fail screens. That code is
// re-implemented here rather than imported — PCR is a locked module, and
// every mission in this pack is an independently self-contained feature
// folder (PCR itself only imports Chunk/Phrase Reading's DATASETS, never
// their engines) — so a future edit to one locked mission can never
// silently break another.
//
// What's genuinely unique to this mission is the Brain Challenge itself.
// Chunk Reading (via PCR) tests VISUAL GROUPING: distractors are other,
// unrelated chunks from the same round — "did you see this." Phrase
// Reading tests MEANING RECOGNITION: distractors are near-identical
// variants of the exact phrase, one word apart — "did you register the
// exact idea, not just the topic." That requires content authored as
// clusters (phraseClusterDataset.ts) rather than the generic "any other
// same-length item" distractor rule every other mission uses.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { ChoiceGrid } from '@/components/exercise-engine/ChoiceGrid'
import { RuntimeResultScreen, type RuntimeResultExtraStat, type RuntimeResultLabels } from '@/components/exercise-engine/RuntimeResultScreen'
import { ReadingJourney } from '@/components/exercise-engine/ReadingJourney'
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
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { pickItems } from '@/lib/exercise-engine/randomizationEngine'
import type { ItemResponse, DifficultyTier, SessionItem } from '@/types/exercise-engine'
import { PHRASE_READING_DEFINITION } from '../definitions/phraseReadingDefinition'
import {
  getPhraseReadingProfile,
  getPhraseReadingLevelRequirement,
  phraseReadingLevel,
  phraseReadingPassPercent,
  phraseReadingPhrasesForRound,
  phraseReadingTotalPhrasesForLevel,
  PHRASE_READING_LEVEL_NAME,
  PHRASE_READING_LENGTH_LABEL,
  PHRASE_READING_TYPOGRAPHY_ROLE,
  PHRASE_READING_LEVEL_DEFAULT_TIER,
  PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT,
  type PhraseReadingLevel,
} from '../phraseDifficulty'
import { getPhraseClustersForLevel, getPhraseClustersFromPool, type PhraseCluster } from '../phraseClusterDataset'
import {
  buildPhraseReadingRound,
  computePhraseLevelPassed,
  computePhraseReadingRhythm,
  computePhraseSessionWpm,
  computePhraseWpmImprovement,
  totalWordsInPhrases,
} from '../phraseEngine'
import {
  pickChallengeType,
  PHRASE_CHALLENGE_PROMPTS,
  challengeTypeShowsContext,
  type PhraseChallengeType,
} from '../phraseChallengeLibrary'
import {
  appendPhraseReadingSession,
  computePhraseReadingAnalytics,
  getRecentlyShownPhrases,
} from '../phraseHistory'
// Level 5 ("Advanced Phrase Reading") — ported from Sentence Reading's
// engine (see phraseAdvancedEngine.ts's header for the full rationale).
import { getAdvancedPhrasesForLevel, ADVANCED_PHRASES } from '../phraseAdvancedLibrary'
import { buildAdvancedPhraseRound, computeBestStreak, type AdvancedPhraseChallengeMeta } from '../phraseAdvancedEngine'
import {
  ADVANCED_PHRASE_CHALLENGE_TYPES,
  advancedPhraseChallengeShowsContext,
  advancedPhraseChallengePrompt,
} from '../phraseAdvancedChallengeLibrary'
// Read-only reuse from Sentence Reading — a real-percentage pass/fail
// comparison, needed because Level 5's 88% bar (and Sentence Reading's own
// bars) don't divide evenly into an integer ratio the way Levels 1-4's do.
import { computeSentenceLevelPassed } from '../../quantum-speed-reading/sentenceDifficulty'
import {
  buildPhraseReadingRecommendation,
  computeReadingReadiness,
  computeMeaningRecognitionLabel,
  computeLanguageProcessingLabel,
  computeTodaysAchievement,
  computeLevelCoachLine,
} from '../phraseRecommendation'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'
// Reused, read-only, from Word Flash — same precedent PCR already
// established for this exact function.
import { computeFlashXp } from '../../flash-intelligence/wordFlashEngine'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'

const EXERCISE_ID = 'phrase-reading'
const LAB_HREF = '/labs/quantum-speed-reading'
const NEXT_MISSION_HREF = '/labs/quantum-speed-reading/multi-line-reading'
const NEXT_MISSION_ID = 'multi-line-reading'
const NEXT_MISSION_NAME = 'Multi-Line Reading™'

const FEEDBACK_MS = 450
const MIN_PHRASE_DISPLAY_MS = 500
const MIN_PHRASE_DISPLAY_MS_REDUCED_MOTION = 900

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Meaning Recognition Strengthened',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Reading Pace',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Avg Response Time',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Continue →',
}

function wordCountOf(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function levelPhraseDescriptor(level: PhraseReadingLevel): string {
  if (level === 1) return 'simple action phrases'
  if (level === 2) return 'learning phrases'
  if (level === 3) return 'meaning-rich phrases'
  if (level === 4) return 'extended phrase fragments'
  return 'advanced 6-8 word phrases'
}

// A round's fully-resolved content — carries which tier it drew from (for
// msPerWord pacing) alongside the phrases/questions the engine built.
// Levels 1-4 use the cluster-native-distractor engine (1 Brain Challenge
// per round); Level 5 ("Advanced Phrase Reading") uses the ported
// Sentence Reading engine (2 Brain Challenges per phrase, cross-pool
// distractors) — a discriminated union keeps both round shapes in the
// same `blocks` array, `runtime`, and render tree rather than forking the
// whole component, so Levels 1-4's existing code paths stay byte-for-byte
// unchanged (every 'standard' block always yields exactly 1 question, by
// construction of buildPhraseReadingRound's hardcoded questionsPerRound).
type StandardPhraseRoundBlock = {
  kind: 'standard'
  tier: DifficultyTier
  phrases: string[]
  questions: SessionItem[]
  challengeType: PhraseChallengeType
}
type AdvancedPhraseRoundBlock = {
  kind: 'advanced'
  tier: DifficultyTier
  phraseText: string
  questions: SessionItem[]
  challenges: AdvancedPhraseChallengeMeta[]
}
type PhraseReadingRoundBlock = StandardPhraseRoundBlock | AdvancedPhraseRoundBlock

function blockPhrases(block: PhraseReadingRoundBlock): string[] {
  return block.kind === 'standard' ? block.phrases : [block.phraseText]
}

// ── Practice — phrases presented automatically, zero interaction ─────────
// Reuses useExercisePhaseTimer directly: each phrase is one timed phase.

function PhrasePracticeBlock({
  phrases,
  phases,
  typographyRole,
  prefersReducedMotion,
  onComplete,
}: {
  phrases: string[]
  phases: PhaseConfig<string>[]
  typographyRole: 'reading-1' | 'reading-2' | 'reading-3' | 'reading-4' | 'reading-5'
  prefersReducedMotion: boolean
  onComplete: () => void
}): React.JSX.Element {
  const timer = useExercisePhaseTimer(phases, onComplete)
  const currentIndex = Number(timer.phaseId)
  const currentPhrase = phrases[currentIndex] ?? phrases[phrases.length - 1] ?? ''

  return (
    <div
      className="flex min-h-[220px] w-full flex-col items-center justify-center gap-8"
      style={{ opacity: timer.boundaryOpacity }}
    >
      <div
        key={timer.phaseId}
        className={cn('w-full', !prefersReducedMotion && 'animate-in fade-in duration-300')}
        aria-live="polite"
        aria-label={currentPhrase}
      >
        <FitText
          text={currentPhrase}
          role={typographyRole}
          className="select-none text-center font-medium tracking-normal text-foreground"
        />
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {phrases.map((_, i) => (
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

// ── Level Map — always shown: ✔────●────○────○────○ / L1..L5

function LevelMap({ currentLevel }: { currentLevel: PhraseReadingLevel }): React.JSX.Element {
  const levels: PhraseReadingLevel[] = [1, 2, 3, 4, 5]
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
}: {
  missionNumber: number
  level: PhraseReadingLevel
}): React.JSX.Element {
  return (
    <div className="absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-center">
      <p className="text-xs font-medium tabular-nums text-muted-foreground">
        Mission {missionNumber} • Level {level}
      </p>
      <LevelMap currentLevel={level} />
      <p className="text-[10px] text-muted-foreground/70">
        Phrase Length: <span className="font-medium text-foreground/80">{PHRASE_READING_LENGTH_LABEL[level]}</span>
      </p>
      <ReadingJourney currentStage="phrase" compact />
    </div>
  )
}

// ── Session — everything between Mission Ready and Mission Complete. A
//    fresh instance per session (keyed by sessionKey in the parent).

type QuestionSubPhase = 'response' | 'feedback'
type SessionSubPhase = 'reading' | 'question' | 'passScreen' | 'failScreen'

type EvalData = {
  level: PhraseReadingLevel
  correctCount: number
  totalCount: number
  percent: number
  requiredPercent: number
  passed: boolean
}

function PhraseReadingSession({
  tier,
  analytics,
  onRestart,
  seed,
  assetPool,
  exitHref,
  onComplete,
}: {
  tier: DifficultyTier
  analytics: ReturnType<typeof computePhraseReadingAnalytics>
  onRestart: () => void
  seed: number
  // QSR-ENGINE-SWAP-1 — additive, optional. When supplied (real
  // per-document phrases), every level draws from this same real pool
  // instead of PHRASE_LEVEL_CLUSTERS — the standalone Lab's hardcoded
  // per-level/Advanced-Level-5 path is completely untouched when absent.
  assetPool?: readonly PhraseCluster[]
  exitHref?: string
  onComplete?: (result: RuntimeResult) => void
}): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('phrase-reading', LAB_HREF)
  const resolvedExitHref = exitHref ?? LAB_HREF
  const startingLevel = phraseReadingLevel(tier)
  const startingProfile = getPhraseReadingProfile(tier)

  // ── On-demand round generation — one round at a time, reactively ──────
  // `seed` is server-generated (see page.tsx) and passed down as a prop so
  // the very first render is identical between SSR and hydration — a bare
  // `Date.now()` here previously ticked between the server render and the
  // client's hydration render, causing a hydration-mismatch crash.
  const sessionSeedRef = useRef(seed)
  const roundGenerationCountRef = useRef(0)
  const usedMembersRef = useRef(new Set<string>())
  const usedAdvancedPhrasesRef = useRef(new Set<string>())
  const recentlyShownRef = useRef<Set<string> | null>(null)
  if (recentlyShownRef.current === null) recentlyShownRef.current = getRecentlyShownPhrases(EXERCISE_ID)

  const fetchRoundForLevel = useCallback((level: PhraseReadingLevel, roundIndexInLevel: number): PhraseReadingRoundBlock | null => {
    const roundTier = PHRASE_READING_LEVEL_DEFAULT_TIER[level]
    const genSeed = sessionSeedRef.current + roundGenerationCountRef.current * 104729
    roundGenerationCountRef.current += 1

    // QSR-ENGINE-SWAP-1 — the standalone Lab's special "Advanced Phrase
    // Reading" Level 5 (a separate hardcoded dataset) only applies when
    // running on the Lab's own hardcoded content; real per-document mode
    // keeps all 5 levels on the same real asset pool.
    if (level === 5 && assetPool === undefined) {
      const phrases = getAdvancedPhrasesForLevel(1, usedAdvancedPhrasesRef.current, genSeed)
      const phrase = phrases[0]
      if (!phrase) return null

      const requestedTypes = pickItems([...ADVANCED_PHRASE_CHALLENGE_TYPES], 2, genSeed + 40009)
      const round = buildAdvancedPhraseRound(phrase, ADVANCED_PHRASES, requestedTypes, genSeed)
      if (round.questions.length === 0) return null

      usedAdvancedPhrasesRef.current.add(phrase.text)
      return { kind: 'advanced', tier: roundTier, phraseText: phrase.text, questions: round.questions, challenges: round.challenges }
    }

    const clusterCount = phraseReadingPhrasesForRound(roundIndexInLevel)
    const recentlyShown = recentlyShownRef.current ?? new Set<string>()
    const excludeSet = new Set([...usedMembersRef.current, ...recentlyShown])

    const clusters = assetPool !== undefined
      ? getPhraseClustersFromPool(assetPool, clusterCount, excludeSet, genSeed)
      : getPhraseClustersForLevel(level, clusterCount, excludeSet, genSeed)
    if (clusters.length === 0) return null

    const requestedType = pickChallengeType(level, genSeed + 70003)
    const round = buildPhraseReadingRound(clusters, 1, genSeed, requestedType)
    if (round.phrases.length === 0) return null

    for (const phrase of round.phrases) usedMembersRef.current.add(phrase)
    return { kind: 'standard', tier: roundTier, phrases: round.phrases, questions: round.questions, challengeType: round.challengeType }
  }, [assetPool])

  const [blocks, setBlocks] = useState<PhraseReadingRoundBlock[]>(() => {
    const first = fetchRoundForLevel(startingLevel, 0)
    return first ? [first] : []
  })
  const [currentLevel, setCurrentLevel] = useState<PhraseReadingLevel>(startingLevel)

  const highestLevelThisSession = useRef<PhraseReadingLevel>(startingLevel)

  const { items, itemToBlockIndex, itemToQuestionIndex } = useMemo(() => {
    const flatItems = blocks.flatMap((b) => b.questions)
    const blockIndexMap: number[] = []
    const questionIndexMap: number[] = []
    blocks.forEach((block, blockIdx) => {
      block.questions.forEach((_, qIdx) => { blockIndexMap.push(blockIdx); questionIndexMap.push(qIdx) })
    })
    return { items: flatItems, itemToBlockIndex: blockIndexMap, itemToQuestionIndex: questionIndexMap }
  }, [blocks])

  const onSessionComplete = useCallback(async (result: RuntimeResult): Promise<void> => {
    await savePracticeSession({
      labId: PHRASE_READING_DEFINITION.labId,
      exerciseId: PHRASE_READING_DEFINITION.id,
      durationMs: Math.max(1, result.metrics.sessionDurationMs),
      completed: result.metrics.accuracyPercent >= PHRASE_READING_DEFINITION.adaptiveRules.minAccuracyToComplete,
    })
  }, [])

  const runtime = useUniversalExerciseRuntime({
    definition: PHRASE_READING_DEFINITION,
    items,
    nextExerciseId: NEXT_MISSION_ID,
    nextExerciseHref: NEXT_MISSION_HREF,
    onSessionComplete,
  })

  const floorMs = prefersReducedMotion ? MIN_PHRASE_DISPLAY_MS_REDUCED_MOTION : MIN_PHRASE_DISPLAY_MS

  const [subPhase, setSubPhase] = useState<SessionSubPhase>('reading')
  const [questionSelectedIndex, setQuestionSelectedIndex] = useState<number | null>(null)
  const [questionSubPhase, setQuestionSubPhase] = useState<QuestionSubPhase>('response')
  const [evalData, setEvalData] = useState<EvalData | null>(null)
  const isVictoryRevealed = useMicroVictoryReveal(1500, evalData?.level)
  // Sprint-16 — Delight Layer™. See ProgressiveChunkReadingExperience.tsx
  // for the full rationale — the coaching-adjacent value stays keyed to
  // the raw evalData.percent, never the in-flight animated value.
  const animatedPercent = useCountUp(evalData?.percent ?? 0, 700, prefersReducedMotion)
  const animatedCorrectCount = useCountUp(evalData?.correctCount ?? 0, 700, prefersReducedMotion)
  const questionStartTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptResponsesRef = useRef<ItemResponse[]>([])
  const roundIndexInLevelRef = useRef(0)
  // Only meaningfully incremented within 'advanced' blocks (2
  // questions/round); for 'standard' blocks questionsPerRound is always 1,
  // so this always resets to 0 on the very next response — a harmless
  // no-op that preserves Levels 1-4's existing 1-question-per-round
  // behavior exactly.
  const questionIndexInRoundRef = useRef(0)
  const leveledUpThisSessionRef = useRef(false)
  // Whole-session response log (across retries and level-ups alike) — only
  // consumed by Level 5's Best Streak stat at Mission Complete, but safe
  // and free to populate for every level.
  const sessionResponsesRef = useRef<ItemResponse[]>([])

  // A response answered on the LAST round of a level attempt is held here
  // until the learner clicks Continue/Try Again — it must not be recorded
  // (or grow `items`) automatically. Nothing auto-advances.
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
  const currentBlockProfile = currentBlock ? getPhraseReadingProfile(currentBlock.tier) : startingProfile
  const currentItem = items[runtime.currentIndex] ?? null
  const currentQuestionIndex = itemToQuestionIndex[runtime.currentIndex] ?? 0
  const currentChallenge: AdvancedPhraseChallengeMeta | null =
    currentBlock?.kind === 'advanced' ? currentBlock.challenges[currentQuestionIndex] ?? null : null
  const levelRequirement = getPhraseReadingLevelRequirement(currentLevel)

  const readingPhases: PhaseConfig<string>[] = useMemo(() => {
    if (!currentBlock) return []
    return blockPhrases(currentBlock).map((phrase, i) => ({
      id: String(i),
      durationMs: Math.max(floorMs, wordCountOf(phrase) * currentBlockProfile.msPerWord),
    }))
  }, [currentBlock, currentBlockProfile.msPerWord, floorMs])

  const handleReadingComplete = useCallback((): void => {
    setSubPhase('question')
    questionStartTimeRef.current = Date.now()
  }, [])

  function handleSelect(idx: number): void {
    if (questionSubPhase !== 'response' || !currentItem || !currentBlock) return
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
      sessionResponsesRef.current.push(response)

      // For 'standard' blocks this is always 1, so the branch below is
      // always taken on the first (only) question — Levels 1-4's behavior
      // falls out of this unification rather than an explicit level check.
      const questionsPerRound = currentBlock.kind === 'advanced' ? currentBlock.questions.length : 1
      questionIndexInRoundRef.current += 1
      const isLastQuestionOfRound = questionIndexInRoundRef.current >= questionsPerRound

      if (!isLastQuestionOfRound) {
        // More questions in this same phrase's round — both were fetched
        // together, so no growth is needed; record directly.
        questionStartTimeRef.current = Date.now()
        runtime.recordResponse(response)
        return
      }
      questionIndexInRoundRef.current = 0

      attemptResponsesRef.current.push(response)
      roundIndexInLevelRef.current += 1
      const roundsRequiredForAttempt = currentLevel === 5
        ? PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT.itemsPerAttempt
        : levelRequirement.challengesRequired
      const isLastRoundOfAttempt = roundIndexInLevelRef.current >= roundsRequiredForAttempt

      if (!isLastRoundOfAttempt) {
        // More rounds needed before this level attempt can be evaluated —
        // keep reading, uninterrupted.
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
        const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
        const passed = currentLevel === 5
          ? computeSentenceLevelPassed(percent, PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT.requiredPercent)
          : computePhraseLevelPassed(correctCount, levelRequirement.passCount)
        pendingEvalResponseRef.current = response
        setEvalData({
          level: currentLevel,
          correctCount,
          totalCount,
          percent,
          requiredPercent: currentLevel === 5 ? PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT.requiredPercent : phraseReadingPassPercent(currentLevel),
          passed,
        })
        setSubPhase(passed ? 'passScreen' : 'failScreen')
      }
    }, FEEDBACK_MS)
  }

  function beginNextAttempt(level: PhraseReadingLevel): void {
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
    beginNextAttempt((evalData.level + 1) as PhraseReadingLevel)
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
  const totalWords = useMemo(() => totalWordsInPhrases(blocks.flatMap(blockPhrases)), [blocks])
  const totalReadingTimeMs = useMemo(
    () => blocks.reduce((sum, block) => {
      const blockProfile = getPhraseReadingProfile(block.tier)
      return sum + blockPhrases(block).reduce((s, p) => s + Math.max(floorMs, wordCountOf(p) * blockProfile.msPerWord), 0)
    }, 0),
    [blocks, floorMs],
  )
  const estimatedWpm = computePhraseSessionWpm(totalWords, totalReadingTimeMs)
  const result = runtime.result

  // Derived once per completed result — shared by the display values below
  // and the persistence effect, rather than recomputed twice.
  const completedSummary = useMemo(() => {
    if (result === null) return null
    const readingRhythm = computePhraseReadingRhythm(
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
    const nextLevel = phraseReadingLevel(nextTier)
    const wpmImprovement = computePhraseWpmImprovement(
      estimatedWpm,
      analytics.previousEstimatedWpm,
      result.metrics.accuracyPercent,
      startingProfile.requiredAccuracyToAdvance,
    )
    const flashXpEarned = computeFlashXp(result.metrics.performanceScore, result.metrics.totalCount)
    const readiness = computeReadingReadiness(result.metrics.accuracyPercent, startingProfile.requiredAccuracyToAdvance)
    const meaningRecognition = computeMeaningRecognitionLabel(result.metrics.accuracyPercent)
    const languageProcessing = computeLanguageProcessingLabel(result.metrics.averageReactionTimeMs)
    const levelsCompleted = Math.max(highestLevelThisSession.current, analytics.highestLevelEverReached ?? 0) as PhraseReadingLevel
    const todaysAchievement = computeTodaysAchievement({ leveledUpThisSession: leveledUpThisSessionRef.current, readingRhythm })

    return {
      readingRhythm, promoted: progression.shouldPromote, recovered: recovery.shouldRecover, nextLevel,
      wpmImprovement, flashXpEarned, readiness, meaningRecognition, languageProcessing, levelsCompleted, todaysAchievement,
    }
  }, [result, tier, startingProfile.requiredAccuracyToAdvance, analytics.previousEstimatedWpm, analytics.totalSessions, analytics.highestLevelEverReached, estimatedWpm])

  let extraStats: RuntimeResultExtraStat[] = []
  let coachMessage = ''
  let extraContent: React.ReactNode = null

  if (result !== null && completedSummary !== null) {
    const recommendation = buildPhraseReadingRecommendation({
      accuracyPercent: result.metrics.accuracyPercent,
      readingRhythm: completedSummary.readingRhythm,
      phraseDescriptor: levelPhraseDescriptor(highestLevelThisSession.current),
      nextPhraseDescriptor: levelPhraseDescriptor(completedSummary.nextLevel),
      promoted: completedSummary.promoted,
      recovered: completedSummary.recovered,
      seed: runtime.currentIndex + tier.length,
    })
    coachMessage = recommendation.coachParagraph

    extraStats = [
      { label: 'Meaning Recognition', value: completedSummary.meaningRecognition, hint: 'How precisely you recognised the exact idea, not just the topic.' },
      { label: 'Recognition Accuracy', value: `${result.metrics.accuracyPercent}%`, hint: 'The share of Brain Challenges answered correctly.' },
      { label: 'Reading Fluency', value: completedSummary.readingRhythm, hint: 'Whether your reading pace held or increased alongside comprehension.' },
      { label: 'Language Processing', value: completedSummary.languageProcessing, hint: 'How quickly you resolved each Brain Challenge — active comprehension speed, not reading pace.' },
      { label: 'Brain XP', value: `${completedSummary.flashXpEarned}`, hint: 'Cognitive training points earned this session.' },
    ]

    // Best Streak — ported from Sentence Reading, only surfaced once a
    // session has actually reached Level 5 ("Advanced Phrase Reading"),
    // the level whose engine tracks it.
    if (highestLevelThisSession.current === 5) {
      extraStats.push({
        label: 'Best Streak',
        value: `${computeBestStreak(sessionResponsesRef.current)}`,
        hint: 'The longest run of consecutive correct answers this session.',
      })
    }

    extraContent = (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Today&apos;s Achievement: <span className="font-medium text-foreground">{completedSummary.todaysAchievement}</span></p>
        <p>Estimated Reading Gain: <span className="font-medium text-foreground">{completedSummary.wpmImprovement === null ? 'Establishing baseline' : `${completedSummary.wpmImprovement >= 0 ? '+' : ''}${completedSummary.wpmImprovement} WPM`}</span></p>
        <p>Reading Readiness: <span className="font-medium text-foreground">{completedSummary.readiness}</span></p>
        <p>Next Mission: <span className="font-medium text-foreground">{NEXT_MISSION_NAME}</span></p>
      </div>
    )
  }

  // Persist exactly once per completed session — an effect, not inline
  // render logic, so this never fires during render.
  const notifiedResultRef = useRef<RuntimeResult | null>(null)
  useEffect(() => {
    if (result === null || completedSummary === null || notifiedResultRef.current === result) return
    notifiedResultRef.current = result
    const stimuli = blocks.flatMap(blockPhrases)
    appendPhraseReadingSession(EXERCISE_ID, {
      timestamp: Date.now(),
      tier,
      phrasesRead: stimuli.length,
      recognitionAccuracyPercent: result.metrics.accuracyPercent,
      estimatedWpm,
      readingRhythm: completedSummary.readingRhythm,
      highestLevelReached: highestLevelThisSession.current,
      promoted: completedSummary.promoted,
      recovered: completedSummary.recovered,
      stimuli,
    })
  }, [result, completedSummary, blocks, tier, estimatedWpm])

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {(runtime.phase === 'playing' || runtime.phase === 'paused') && (
        <LevelHud missionNumber={analytics.totalSessions + 1} level={currentLevel} />
      )}

      <button
        onClick={() => { clearTimer(); router.push(getCurriculumSmartExitHref('phrase-reading', resolvedExitHref)) }}
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
            <ReadingJourney currentStage="phrase" />
            <div className="flex flex-col items-center gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Phrase Reading™</h1>
              <p className="text-sm font-medium text-muted-foreground">Read Ideas, Not Words</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Recognise complete ideas instead of reading word-by-word.
            </p>
            <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-left text-xs">
              <dt className="text-muted-foreground">Today&apos;s Goal</dt>
              <dd className="font-medium text-foreground">Meaning Recognition</dd>
              <dt className="text-muted-foreground">Current Level</dt>
              <dd className="font-medium text-foreground">{startingLevel} · {PHRASE_READING_LEVEL_NAME[startingLevel]}</dd>
              <dt className="text-muted-foreground">Phrase Length</dt>
              <dd className="font-medium text-foreground">{PHRASE_READING_LENGTH_LABEL[startingLevel]}</dd>
              <dt className="text-muted-foreground">Mission</dt>
              <dd className="font-medium text-foreground">
                {startingLevel === 5
                  ? `${PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT.itemsPerAttempt} Advanced Phrases`
                  : `${phraseReadingTotalPhrasesForLevel(startingLevel)} Meaningful Phrases`}
              </dd>
              <dt className="text-muted-foreground">Estimated Time</dt>
              <dd className="font-medium text-foreground">About 3 Minutes</dd>
              <dt className="text-muted-foreground">Brain Skill</dt>
              <dd className="font-medium text-foreground">Language Processing</dd>
              <dt className="text-muted-foreground">Reading Benefit</dt>
              <dd className="font-medium text-foreground">Recognise complete ideas, not word-by-word.</dd>
            </dl>
            <p className="text-xs text-muted-foreground/70">
              {startingLevel === 5
                ? `Level 5 needs ${PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT.requiredPercent}% correct`
                : `Level ${startingLevel} needs ${getPhraseReadingLevelRequirement(startingLevel).passCount} of ${getPhraseReadingLevelRequirement(startingLevel).challengesRequired} Brain Challenges correct`}
              {analytics.totalSessions > 0 ? ` · Mission ${analytics.totalSessions + 1}` : ''}
            </p>
            <button
              onClick={runtime.startSession}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Start Mission
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
              <PhrasePracticeBlock
                key={currentBlockIndex}
                phrases={blockPhrases(currentBlock)}
                phases={readingPhases}
                typographyRole={PHRASE_READING_TYPOGRAPHY_ROLE[currentLevel]}
                prefersReducedMotion={prefersReducedMotion}
                onComplete={handleReadingComplete}
              />
            )}
            {subPhase === 'question' && currentItem && currentBlock && (
              <div className="flex w-full flex-col items-center gap-4">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase" aria-hidden="true">Brain Challenge</p>
                {(currentBlock.kind === 'standard'
                  ? challengeTypeShowsContext(currentBlock.challengeType)
                  : currentChallenge !== null && advancedPhraseChallengeShowsContext(currentChallenge.type)) && (
                  <FitText
                    text={currentItem.stimulus}
                    role={PHRASE_READING_TYPOGRAPHY_ROLE[currentLevel]}
                    className="select-none text-center font-medium tracking-normal text-foreground"
                  />
                )}
                <ChoiceGrid
                  options={currentItem.options}
                  correctIndex={currentItem.correctIndex}
                  onSelect={handleSelect}
                  selectedIndex={questionSelectedIndex}
                  isFeedback={questionSubPhase === 'feedback'}
                  disabled={questionSubPhase !== 'response'}
                  promptLabel={currentBlock.kind === 'standard' ? PHRASE_CHALLENGE_PROMPTS[currentBlock.challengeType] : (currentChallenge?.prompt ?? advancedPhraseChallengePrompt('main-idea'))}
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
          exerciseName={PHRASE_READING_DEFINITION.title}
          trainsAbility={PHRASE_READING_DEFINITION.trainsAbility}
          result={result}
          labHref={getWizardAwareBackHref('phrase-reading', LAB_HREF)}
          onPracticeAgain={handlePracticeAgain}
          extraStats={extraStats}
          coachMessage={coachMessage}
          extraContent={extraContent}
          labels={RESULT_LABELS}
          {...(curriculumSession.isActiveStep
            ? { onNext: curriculumSession.advance }
            : onComplete !== undefined
              ? { onNext: () => onComplete(result) }
              : {})}
        />
      )}
    </div>
  )
}

// ── Outer component — session bookkeeping (tier, analytics, restart).
//    Content generation lives entirely inside the inner Session component,
//    since it happens reactively as levels are earned rather than all
//    upfront.

type PhraseReadingExperienceProps = {
  // Generated once per request by the Server Component in page.tsx — kept
  // stable across the SSR render and the client hydration render.
  initialSeed: number
  // QSR-ENGINE-SWAP-1 — additive, optional real-document integration seam,
  // mirroring ProgressiveChunkReadingExperience's own contentPool?/exitHref?/
  // onComplete? seam (Sprint QSR-2.6) exactly. Absent (standalone Lab):
  // unchanged hardcoded behavior.
  assetPool?: readonly PhraseCluster[]
  exitHref?: string
  onComplete?: (result: RuntimeResult) => void
}

export function PhraseReadingExperience({ initialSeed, assetPool, exitHref, onComplete }: PhraseReadingExperienceProps): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  const state = useMemo(
    () => loadState(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  const analytics = useMemo(
    () => computePhraseReadingAnalytics(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  function handleRestart(): void {
    setSessionKey((k) => k + 1)
  }

  return (
    <PhraseReadingSession
      key={sessionKey}
      tier={state.currentDifficultyTier}
      analytics={analytics}
      onRestart={handleRestart}
      seed={initialSeed + sessionKey * 999983}
      {...(assetPool !== undefined ? { assetPool } : {})}
      {...(exitHref !== undefined ? { exitHref } : {})}
      {...(onComplete !== undefined ? { onComplete } : {})}
    />
  )
}
