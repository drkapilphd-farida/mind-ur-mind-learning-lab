'use client'

// Multi-Line Reading™ Experience — Reading Intelligence Pack™'s Mission 3.
// Architecturally related to Progressive Chunk Reading™ and Phrase
// Reading™ (Mission → Level → Practice → Brain Challenge → Pass/Retry →
// Continue → Next Level → Mission Complete, growable `items`, the
// deferred-response-after-growth pattern, a Level Map, exact-microcopy
// Pass/Fail screens) — that code is re-implemented here rather than
// imported, since both those missions are locked and every mission in
// this pack stays an independently self-contained feature folder.
//
// What's genuinely unique to THIS mission: Chunk Reading trains VISUAL
// GROUPING and Phrase Reading trains MEANING RECOGNITION — both flash one
// unit at a time. Multi-Line Reading trains SPATIAL READING / EYE
// NAVIGATION: a whole paragraph (every line) appears simultaneously,
// left-aligned like a real page, read with no highlighting and no
// interaction, then disappears as a whole block. Brain Challenges test
// WHERE specific content lived ("which line contained…"), not what it
// meant or how it was grouped. A paragraph-round yields exactly 2
// Brain Challenges (not 1, unlike PCR/Phrase) before the next paragraph
// begins — see the 3-way branch in handleSelect below.

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
import type { ItemResponse, DifficultyTier } from '@/types/exercise-engine'
import { MULTI_LINE_READING_DEFINITION } from '../definitions/multiLineReadingDefinition'
import {
  getMultiLineReadingProfile,
  getMultiLineLevelRequirement,
  multiLineReadingLevel,
  computeMultiLineLevelPassed,
  MULTI_LINE_READING_LEVEL_NAME,
  MULTI_LINE_READING_SIZE_LABEL,
  MULTI_LINE_READING_LEVEL_DEFAULT_TIER,
  type MultiLineReadingLevel,
} from '../multiLineDifficulty'
import { getMultiLineParagraphsForLevel } from '../multiLineParagraphDataset'
import { buildMultiLineRound, type MultiLineChallengeMeta } from '../multiLineEngine'
import { multiLineChallengeShowsContext } from '../multiLineChallengeLibrary'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'
// Reused, read-only, from Word Flash — same precedent PCR/Phrase already established for this exact function.
import { computeFlashXp } from '../../flash-intelligence/wordFlashEngine'
import { getCurriculumSmartCompleteHref, getCurriculumSmartExitHref, isCurriculumSessionCurrentExercise } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { computeReadingReadiness } from '../../flash-intelligence/wordFlashInsights'

const EXERCISE_ID = 'multi-line-reading'
const LAB_HREF = '/labs/quantum-speed-reading'
// Sprint-12: Sentence Reading now exists and is next in Core Reading
// Journey™'s sequence — Mission Complete continues forward into it instead
// of dead-ending back at the lab.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/sentence-reading'

const FEEDBACK_MS = 450
const MIN_LINE_DISPLAY_MS = 1200

// Level Complete / Try Again — one-sentence "what your brain just learned"
// line, same 3-tier shape as sentenceRecommendation.ts's computeLevelCoachLine.
function computeLevelCoachLine(accuracyPercent: number): string {
  if (accuracyPercent >= 90) return 'Line tracking is becoming automatic.'
  if (accuracyPercent >= 70) return 'Your eyes are learning where to move next.'
  return 'Focus on tracking one line at a time before moving faster.'
}
const MIN_LINE_DISPLAY_MS_REDUCED_MOTION = 1800

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Line Tracking Strengthened',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Reading Pace',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Avg Response Time',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Back to Lab →',
}

function wordCountOf(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function paragraphWordCount(lines: readonly string[]): number {
  return lines.reduce((sum, line) => sum + wordCountOf(line), 0)
}

// A round's fully-resolved content — carries which tier it drew from (for
// msPerWord pacing) and the per-question Challenge Library metadata
// (parallel to `questions` — each of the round's 2 questions can be a
// different type) alongside the lines/questions the engine built.
type MultiLineRoundBlock = {
  tier: DifficultyTier
  lines: string[]
  questions: ReturnType<typeof buildMultiLineRound>['questions']
  challenges: MultiLineChallengeMeta[]
}

// ── Practice — the whole paragraph appears at once, left-aligned, no
//    highlighting, no interaction — the core "spatial, not sequential"
//    mechanic that makes this mission train eye navigation rather than
//    single-unit recognition. A single useExercisePhaseTimer phase (not
//    one phase per line) controls when the whole block disappears.

function ParagraphPracticeBlock({
  lines,
  phase,
  prefersReducedMotion,
  onComplete,
}: {
  lines: string[]
  phase: PhaseConfig<string>
  prefersReducedMotion: boolean
  onComplete: () => void
}): React.JSX.Element {
  const timer = useExercisePhaseTimer([phase], onComplete)

  return (
    <div
      className="flex w-full max-w-md flex-col gap-2.5"
      style={{ opacity: timer.boundaryOpacity }}
      aria-live="polite"
    >
      {lines.map((line, index) => (
        <FitText
          key={index}
          as="p"
          role="line"
          text={line}
          className={cn('text-left font-medium text-foreground', !prefersReducedMotion && 'animate-in fade-in duration-300')}
        />
      ))}
    </div>
  )
}

// ── Level Map — always shown: ✔────●────○────○────○ / L1..L5

function LevelMap({ currentLevel }: { currentLevel: MultiLineReadingLevel }): React.JSX.Element {
  const levels: MultiLineReadingLevel[] = [1, 2, 3, 4, 5]
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
  level,
}: {
  level: MultiLineReadingLevel
}): React.JSX.Element {
  return (
    <div className="absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-center">
      <p className="text-xs font-medium tabular-nums text-muted-foreground">Level {level}</p>
      <LevelMap currentLevel={level} />
      <p className="text-[10px] text-muted-foreground/70">
        Paragraph Size: <span className="font-medium text-foreground/80">{MULTI_LINE_READING_SIZE_LABEL[level]}</span>
      </p>
      <ReadingJourney currentStage="multi-line" compact />
    </div>
  )
}

// ── Session — everything between Mission Ready and Mission Complete. A
//    fresh instance per session (keyed by sessionKey in the parent).

type QuestionSubPhase = 'response' | 'feedback'
type SessionSubPhase = 'reading' | 'question' | 'passScreen' | 'failScreen'

type EvalData = {
  level: MultiLineReadingLevel
  percent: number
  requiredPercent: number
  passed: boolean
}

function MultiLineReadingSession({
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
  const startingLevel = multiLineReadingLevel(tier)
  const startingProfile = getMultiLineReadingProfile(tier)

  // ── On-demand round generation — one paragraph at a time, reactively ──
  // `seed` is server-generated (see page.tsx) and passed down as a prop so
  // the very first render is identical between SSR and hydration — a bare
  // `Date.now()` here previously ticked between the server render and the
  // client's hydration render, causing a hydration-mismatch crash.
  const sessionSeedRef = useRef(seed)
  const roundGenerationCountRef = useRef(0)
  const usedParagraphsRef = useRef(new Set<string>())

  const fetchRoundForLevel = useCallback((level: MultiLineReadingLevel): MultiLineRoundBlock | null => {
    const roundTier = MULTI_LINE_READING_LEVEL_DEFAULT_TIER[level]
    const genSeed = sessionSeedRef.current + roundGenerationCountRef.current * 104729
    roundGenerationCountRef.current += 1

    const paragraphs = getMultiLineParagraphsForLevel(level, 1, usedParagraphsRef.current, genSeed)
    const paragraph = paragraphs[0]
    if (!paragraph) return null

    const round = buildMultiLineRound(paragraph, 2, genSeed)
    if (round.lines.length === 0) return null

    usedParagraphsRef.current.add(paragraph.lines[0]!)
    return { tier: roundTier, lines: round.lines, questions: round.questions, challenges: round.challenges }
  }, [])

  const [blocks, setBlocks] = useState<MultiLineRoundBlock[]>(() => {
    const first = fetchRoundForLevel(startingLevel)
    return first ? [first] : []
  })
  const [currentLevel, setCurrentLevel] = useState<MultiLineReadingLevel>(startingLevel)

  const highestLevelThisSession = useRef<MultiLineReadingLevel>(startingLevel)

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
      labId: MULTI_LINE_READING_DEFINITION.labId,
      exerciseId: MULTI_LINE_READING_DEFINITION.id,
      durationMs: Math.max(1, result.metrics.sessionDurationMs),
      completed: result.metrics.accuracyPercent >= MULTI_LINE_READING_DEFINITION.adaptiveRules.minAccuracyToComplete,
    })
  }, [])

  const runtime = useUniversalExerciseRuntime({
    definition: MULTI_LINE_READING_DEFINITION,
    items,
    nextExerciseHref: NEXT_EXERCISE_HREF,
    onSessionComplete,
  })

  const floorMs = prefersReducedMotion ? MIN_LINE_DISPLAY_MS_REDUCED_MOTION : MIN_LINE_DISPLAY_MS

  const [subPhase, setSubPhase] = useState<SessionSubPhase>('reading')
  const [questionSelectedIndex, setQuestionSelectedIndex] = useState<number | null>(null)
  const [questionSubPhase, setQuestionSubPhase] = useState<QuestionSubPhase>('response')
  const [evalData, setEvalData] = useState<EvalData | null>(null)
  const isVictoryRevealed = useMicroVictoryReveal(1500, evalData?.level)
  // Sprint-16 — Delight Layer™. See ProgressiveChunkReadingExperience.tsx
  // for the full rationale.
  const animatedPercent = useCountUp(evalData?.percent ?? 0, 700, prefersReducedMotion)
  const questionStartTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptResponsesRef = useRef<ItemResponse[]>([])
  const questionIndexInRoundRef = useRef(0)
  const roundIndexInLevelRef = useRef(0)
  const leveledUpThisSessionRef = useRef(false)

  // A response answered on the LAST question of the LAST paragraph-round
  // of a level attempt is held here until the learner clicks
  // Continue/Try Again — it must not be recorded (or grow `items`)
  // automatically. Nothing auto-advances.
  const pendingEvalResponseRef = useRef<ItemResponse | null>(null)

  // Growing `items` mid-session means `runtime.recordResponse` must be
  // called with a closure that has already seen the new, longer array —
  // calling it in the same tick as the setBlocks() that grows it would
  // still use the stale (shorter) closure. Recording is deferred exactly
  // one render, via this ref + a version counter that forces the effect
  // below to re-run once the growth has landed. Only used when moving to
  // a NEW paragraph — the second question of the SAME paragraph needs no
  // deferral, since both of a paragraph's questions are fetched together
  // and already present in `items`.
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
  const currentBlockProfile = currentBlock ? getMultiLineReadingProfile(currentBlock.tier) : startingProfile
  const currentItem = items[runtime.currentIndex] ?? null
  const levelRequirement = getMultiLineLevelRequirement(currentLevel)

  const readingPhase: PhaseConfig<string> | null = useMemo(() => {
    if (!currentBlock) return null
    return { id: `${currentBlockIndex}`, durationMs: Math.max(floorMs, paragraphWordCount(currentBlock.lines) * currentBlockProfile.msPerWord) }
  }, [currentBlock, currentBlockIndex, currentBlockProfile.msPerWord, floorMs])

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
      questionIndexInRoundRef.current += 1
      const isLastQuestionOfRound = questionIndexInRoundRef.current >= (currentBlock?.questions.length ?? 2)

      if (!isLastQuestionOfRound) {
        // More questions remain for THIS paragraph — both were fetched
        // together and already live in `items`, so no growth is needed.
        // `subPhase` stays 'question'; the runtime advancing currentIndex
        // naturally surfaces the round's next question.
        questionStartTimeRef.current = Date.now()
        runtime.recordResponse(response)
        return
      }

      // Last question of this paragraph — decide whether another
      // paragraph-round is needed before this level attempt can be
      // evaluated.
      questionIndexInRoundRef.current = 0
      roundIndexInLevelRef.current += 1
      const isLastRoundOfAttempt = roundIndexInLevelRef.current >= levelRequirement.paragraphsPerAttempt

      if (!isLastRoundOfAttempt) {
        const nextRound = fetchRoundForLevel(currentLevel)
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
        // Last question of the last round in this attempt — evaluate, but
        // do NOT record the response or grow `blocks` yet. The Pass/Fail
        // screen waits for an explicit Continue/Try Again click.
        const correctCount = attemptResponsesRef.current.filter((r) => r.isCorrect).length
        const totalCount = attemptResponsesRef.current.length
        const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
        const passed = computeMultiLineLevelPassed(percent, levelRequirement.requiredPercent)
        pendingEvalResponseRef.current = response
        setEvalData({ level: currentLevel, percent, requiredPercent: levelRequirement.requiredPercent, passed })
        setSubPhase(passed ? 'passScreen' : 'failScreen')
      }
    }, FEEDBACK_MS)
  }

  function beginNextAttempt(level: MultiLineReadingLevel): void {
    const response = pendingEvalResponseRef.current
    if (response === null) return
    pendingEvalResponseRef.current = null

    const firstRound = fetchRoundForLevel(level)
    if (firstRound === null) {
      // Pool exhausted — never fabricate; end gracefully here.
      runtime.recordResponse(response)
      return
    }

    setCurrentLevel(level)
    if (level > highestLevelThisSession.current) highestLevelThisSession.current = level
    attemptResponsesRef.current = []
    questionIndexInRoundRef.current = 0
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
    beginNextAttempt((evalData.level + 1) as MultiLineReadingLevel)
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
    const nextLevel = multiLineReadingLevel(nextTier)
    const flashXpEarned = computeFlashXp(result.metrics.performanceScore, result.metrics.totalCount)
    const readiness = computeReadingReadiness(result.metrics.accuracyPercent, startingProfile.requiredAccuracyToAdvance)
    const levelsCompleted = highestLevelThisSession.current

    return { promoted: progression.shouldPromote, recovered: recovery.shouldRecover, nextLevel, flashXpEarned, readiness, levelsCompleted }
  }, [result, tier, startingProfile.requiredAccuracyToAdvance, totalSessions])

  let extraStats: RuntimeResultExtraStat[] = []
  let coachMessage = ''
  let extraContent: React.ReactNode = null

  if (result !== null && completedSummary !== null) {
    const accuracy = result.metrics.accuracyPercent
    const trackingLabel = accuracy >= 95 ? 'Excellent' : accuracy >= 85 ? 'Very Good' : accuracy >= 70 ? 'Good' : 'Developing'

    coachMessage = accuracy >= 90
      ? 'Line tracking is becoming automatic — your eyes are learning exactly where to move.'
      : accuracy >= 70
        ? 'Solid navigation this session. Consistency across more lines will sharpen tracking further.'
        : 'Eye navigation across multiple lines takes real practice — stay with shorter paragraphs a little longer.'

    extraStats = [
      { label: 'Line Tracking', value: trackingLabel, hint: 'How reliably you located content across a multi-line paragraph.' },
      { label: 'Recognition Accuracy', value: `${accuracy}%`, hint: 'The share of Brain Challenges answered correctly.' },
      { label: 'Levels Completed', value: `${completedSummary.levelsCompleted} / 5`, hint: 'The highest level you reached this session.' },
      { label: 'Brain XP', value: `${completedSummary.flashXpEarned}`, hint: 'Cognitive training points earned this session.' },
    ]

    extraContent = (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Next Level: <span className="font-medium text-foreground">{MULTI_LINE_READING_LEVEL_NAME[completedSummary.nextLevel]}</span></p>
        <p>Reading Readiness: <span className="font-medium text-foreground">{completedSummary.readiness}</span></p>
      </div>
    )
  }

  // Persist exactly once per completed session — an effect, not inline
  // render logic, so this never fires during render.
  const notifiedResultRef = useRef<RuntimeResult | null>(null)
  useEffect(() => {
    if (result === null || completedSummary === null || notifiedResultRef.current === result) return
    notifiedResultRef.current = result
  }, [result, completedSummary])

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {(runtime.phase === 'playing' || runtime.phase === 'paused') && (
        <LevelHud level={currentLevel} />
      )}

      <button
        onClick={() => { clearTimer(); router.push(getCurriculumSmartExitHref('multi-line-reading', LAB_HREF)) }}
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
            <ReadingJourney currentStage="multi-line" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Multi-Line Reading™</h1>
            <p className="text-sm font-medium text-muted-foreground">Know Where To Look Next</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Train your brain to know exactly where to move your eyes across a paragraph.
            </p>
            <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-left text-xs">
              <dt className="text-muted-foreground">Today&apos;s Goal</dt>
              <dd className="font-medium text-foreground">Train Line Navigation</dd>
              <dt className="text-muted-foreground">Level</dt>
              <dd className="font-medium text-foreground">{startingLevel} · {MULTI_LINE_READING_LEVEL_NAME[startingLevel]}</dd>
              <dt className="text-muted-foreground">Paragraph Size</dt>
              <dd className="font-medium text-foreground">{MULTI_LINE_READING_SIZE_LABEL[startingLevel]}</dd>
              <dt className="text-muted-foreground">Mission</dt>
              <dd className="font-medium text-foreground">20 Paragraphs</dd>
              <dt className="text-muted-foreground">Brain Target</dt>
              <dd className="font-medium text-foreground">Spatial Reading</dd>
            </dl>
            <p className="text-xs text-muted-foreground/70">
              Level {startingLevel} needs {getMultiLineLevelRequirement(startingLevel).requiredPercent}% correct{totalSessions > 0 ? ` · Mission ${totalSessions + 1}` : ''}
            </p>
            <button
              onClick={runtime.startSession}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                <p className="text-2xl font-bold tabular-nums text-success">{Math.round(animatedPercent)}%</p>
                <p className="text-sm font-medium text-muted-foreground">{computeLevelCoachLine(evalData.percent)}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {evalData.level < 5 ? `🔓 Level ${evalData.level + 1}` : '🏆 All Levels Complete'}
                </p>
                <button
                  onClick={handleContinue}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(animatedPercent)}%</p>
                <p className="text-xs text-muted-foreground/70">Need {evalData.requiredPercent}%</p>
                <p className="text-xs text-muted-foreground">{computeLevelCoachLine(evalData.percent)}</p>
                {evalData.level < 5 && (
                  <p className="mt-2 text-sm font-medium text-muted-foreground">🔒 Level {evalData.level + 1}</p>
                )}
                <button
                  onClick={handleTryAgain}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Try Again
                </button>
              </div>
            )}
            {subPhase === 'reading' && currentBlock && readingPhase && (
              <ParagraphPracticeBlock
                key={currentBlockIndex}
                lines={currentBlock.lines}
                phase={readingPhase}
                prefersReducedMotion={prefersReducedMotion}
                onComplete={handleReadingComplete}
              />
            )}
            {subPhase === 'question' && currentItem && currentChallenge && (
              <div className="flex w-full flex-col items-center gap-4">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Brain Challenge</p>
                {multiLineChallengeShowsContext(currentChallenge.type) && (
                  <FitText
                    text={currentItem.stimulus}
                    role="display"
                    className="select-none text-center font-medium text-foreground"
                  />
                )}
                <ChoiceGrid
                  options={currentItem.options}
                  correctIndex={currentItem.correctIndex}
                  onSelect={handleSelect}
                  selectedIndex={questionSelectedIndex}
                  isFeedback={questionSubPhase === 'feedback'}
                  disabled={questionSubPhase !== 'response'}
                  promptLabel={currentChallenge.prompt}
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
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Resume
            </button>
          </div>
        )}
      </div>

      {runtime.phase === 'completed' && result !== null && (
        <RuntimeResultScreen
          exerciseName={MULTI_LINE_READING_DEFINITION.title}
          trainsAbility={MULTI_LINE_READING_DEFINITION.trainsAbility}
          result={result}
          labHref={LAB_HREF}
          onPracticeAgain={handlePracticeAgain}
          extraStats={extraStats}
          coachMessage={coachMessage}
          extraContent={extraContent}
          labels={RESULT_LABELS}
          {...(isCurriculumSessionCurrentExercise('multi-line-reading')
            ? { onNext: () => router.push(getCurriculumSmartCompleteHref('multi-line-reading', LAB_HREF)) }
            : {})}
        />
      )}
    </div>
  )
}

// ── Outer component — session bookkeeping (tier, restart). Content
//    generation lives entirely inside the inner Session component, since
//    it happens reactively as levels are earned rather than all upfront.

type MultiLineReadingExperienceProps = {
  // Generated once per request by the Server Component in page.tsx — kept
  // stable across the SSR render and the client hydration render.
  initialSeed: number
}

export function MultiLineReadingExperience({ initialSeed }: MultiLineReadingExperienceProps): React.JSX.Element {
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
    <MultiLineReadingSession
      key={sessionKey}
      tier={state.currentDifficultyTier}
      totalSessions={state.sessionCount}
      seed={initialSeed + sessionKey * 999983}
      onRestart={handleRestart}
    />
  )
}
