'use client'

// Sentence Reading™ Experience — Reading Intelligence Pack™'s Mission 4.
// Full architectural rebuild: the "Mini Learning Chapter" model. A level
// attempt is no longer "read one sentence, answer questions, repeat" —
// it's Theme → 5 complete sentences (all one theme) read in sequence →
// ONE 4-question Brain Challenge testing the WHOLE chapter → Pass/Retry →
// Next Theme. This is what makes the mission feel like reading a premium
// digital lesson (Apple Books / Kindle register) rather than a flash-card
// game, and what makes it train COMPLETE IDEA RECOGNITION across
// connected sentences rather than recognising one isolated unit at a
// time — the defining difference from every earlier mission in this
// pack, including this mission's own prior two builds.
//
// Architecturally related to Progressive Chunk Reading™, Phrase Reading™,
// and Multi-Line Reading™ (Mission → Level → Practice → Brain Challenge →
// Pass/Retry → Continue → Next Level → Mission Complete, a Level Map,
// exact-microcopy Pass/Fail screens) — re-implemented here rather than
// imported, since every locked mission in this pack stays an
// independently self-contained feature folder.
//
// A chapter (5 sentences + 4 questions) is fully known the instant a
// level attempt begins — unlike this mission's prior builds, `items`
// never grows mid-attempt anymore, only at the Continue/Try-Again
// level-transition boundary (same boundary every mission already has).
// This retires the old deferred-response-after-growth machinery entirely
// within a single attempt.

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
import { SENTENCE_READING_DEFINITION } from '../definitions/sentenceReadingDefinition'
import {
  getSentenceReadingProfile,
  getSentenceLevelRequirement,
  sentenceReadingLevel,
  computeSentenceLevelPassed,
  SENTENCE_READING_LEVEL_NAME,
  SENTENCE_READING_LENGTH_LABEL,
  SENTENCE_READING_LEVEL_DEFAULT_TIER,
  SENTENCE_COMPLEXITY_LABEL,
  type SentenceReadingLevel,
} from '../sentenceDifficulty'
import {
  getChapterForLevel,
  getChapterFromPool,
  sentenceWordCount,
  SENTENCE_THEME_BY_LEVEL,
  SENTENCE_THEME_NAME,
  type SentenceChapter,
  type ChapterSentence,
  type SentenceReadingTheme,
} from '../sentenceLibrary'
import { buildChapterChallenges, computeBestStreak, resolveUsableSentenceChallengeTypes, type SentenceChallengeMeta } from '../sentenceEngine'
import { SENTENCE_CHALLENGE_TYPES } from '../sentenceChallengeLibrary'
import {
  buildSentenceReadingRecommendation,
  computeIdeaProcessingRhythm,
  computeBrainPerformanceLabel,
  computeTodaysAchievement,
  computeLevelCoachLine,
  computeThemeMastery,
} from '../sentenceRecommendation'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'
// Reused, read-only, from Word Flash — same precedent every mission in this pack already established.
import { computeFlashXp } from '../../flash-intelligence/wordFlashEngine'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'

const EXERCISE_ID = 'sentence-reading'
const LAB_HREF = '/labs/quantum-speed-reading'
// Sprint-12: Paragraph Reading now exists and is next in Core Reading
// Journey™'s sequence — Mission Complete continues forward into it instead
// of dead-ending back at the lab.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/paragraph-reading'

const FEEDBACK_MS = 450
const MIN_SENTENCE_DISPLAY_MS = 1200
const MIN_SENTENCE_DISPLAY_MS_REDUCED_MOTION = 1800
// The mandatory ~400ms blank beat between sentences, and again between
// the last sentence and the Brain Challenge. Folded directly into the
// phase-timer array AS phases for the inter-sentence pauses (fully
// deterministic, sequential — the timer hook's own job); the final
// reading→question transition stays a `subPhase` + `setTimeout` exactly
// like the mission's prior builds, since that one depends on external
// state (which UI mode comes next), not a fixed sequence position.
const BRAIN_PAUSE_MS = 400
// How long the "Today's Topic" title card holds before the first
// sentence begins — a distinct beat in the rhythm the brief calls out
// explicitly ("Display: Today's Topic — Nature").
const TOPIC_INTRO_MS = 1400

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Idea Recognition Strengthened',
  correctLabel: 'Correct Answers',
  speedLabel: 'Reading Pace',
  scoreLabel: 'Mission Score',
  // Doubles as the brief's "Processing Speed" field — no separate
  // extraStats tile duplicates this same number under a second label.
  reactionLabel: 'Processing Speed',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Back to Lab →',
}

// Positive-only feedback microcopy — the brief explicitly bans
// "Wrong"/"Incorrect"/"Bad" anywhere in this mission. Correct answers
// rotate through three lines (seeded, not flickering-random); an
// incorrect answer always shows "Keep Building" — encouraging, never
// punitive.
const POSITIVE_FEEDBACK_LINES = ['Idea Recognized', 'Great Processing', 'Strong Understanding'] as const
const KEEP_BUILDING_LINE = 'Keep Building'

const THEME_EMOJI: Record<SentenceReadingTheme, string> = {
  nature: '🌿', science: '🔬', health: '❤️', technology: '💻', psychology: '🧠',
}

function levelPhraseDescriptor(level: SentenceReadingLevel): string {
  if (level === 1) return 'short, connected nature sentences'
  if (level === 2) return 'slightly longer science sentences'
  if (level === 3) return 'fuller health sentences'
  if (level === 4) return 'complex technology sentences'
  return 'full-length psychology sentences'
}

// Mission Complete star rating — a purely presentational transform of the
// session's own already-computed accuracy metric (no new data, no change
// to how accuracy itself is calculated). UI polish only.
function starRatingFromAccuracy(accuracyPercent: number): string {
  const filled = accuracyPercent >= 95 ? 5 : accuracyPercent >= 85 ? 4 : accuracyPercent >= 70 ? 3 : accuracyPercent >= 50 ? 2 : 1
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

// A chapter attempt's fully-resolved content — the theme-locked chapter
// itself, plus the 4 whole-chapter Brain Challenge questions the engine
// built from it. Unlike the mission's prior builds, this is the ONLY
// block a level attempt ever has — it never grows mid-attempt.
type ChapterBlock = {
  tier: DifficultyTier
  chapter: SentenceChapter
  questions: SessionItem[]
  challenges: SentenceChallengeMeta[]
}

// ── Chapter reading — one `useExercisePhaseTimer` sequence covering all
//    5 sentences with mandatory pauses between them, alternating content
//    and blank phases. Fade is computed LOCALLY per phase from
//    elapsedInPhaseMs/phaseDurationMs (never from the hook's own
//    boundaryOpacity, which only fades on the array's true first/last
//    phase — phases 1-3 would otherwise never fade at all).

type ChapterPhaseId = 'sentence-0' | 'pause-0' | 'sentence-1' | 'pause-1' | 'sentence-2' | 'pause-2' | 'sentence-3' | 'pause-3' | 'sentence-4'
const CHAPTER_PHASE_IDS: readonly ChapterPhaseId[] = ['sentence-0', 'pause-0', 'sentence-1', 'pause-1', 'sentence-2', 'pause-2', 'sentence-3', 'pause-3', 'sentence-4']

function buildChapterPhases(sentences: readonly ChapterSentence[], msPerWord: number, floorMs: number): PhaseConfig<ChapterPhaseId>[] {
  return CHAPTER_PHASE_IDS.map((id) => {
    if (id.startsWith('pause')) return { id, durationMs: BRAIN_PAUSE_MS }
    const index = Number(id.split('-')[1])
    return { id, durationMs: Math.max(floorMs, sentenceWordCount(sentences[index]!.text) * msPerWord) }
  })
}

function ChapterReadingBlock({
  chapter,
  msPerWord,
  floorMs,
  prefersReducedMotion,
  onComplete,
}: {
  chapter: SentenceChapter
  msPerWord: number
  floorMs: number
  prefersReducedMotion: boolean
  onComplete: () => void
}): React.JSX.Element {
  const phases = useMemo(() => buildChapterPhases(chapter.sentences, msPerWord, floorMs), [chapter, msPerWord, floorMs])
  const timer = useExercisePhaseTimer(phases, onComplete)
  const isPause = timer.phaseId.startsWith('pause')
  const sentenceIndex = Number(timer.phaseId.split('-')[1])
  const text = isPause ? '' : chapter.sentences[sentenceIndex]!.text

  const fadeIn = Math.min(1, timer.elapsedInPhaseMs / 250)
  const fadeOut = Math.max(0, Math.min(1, (timer.phaseDurationMs - timer.elapsedInPhaseMs) / 300))
  const opacity = prefersReducedMotion ? 1 : Math.min(fadeIn, fadeOut)

  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-8 px-6">
      <div
        className="flex min-h-[140px] w-full max-w-2xl items-center justify-center"
        style={{
          opacity,
          transform: prefersReducedMotion ? undefined : `scale(${0.98 + opacity * 0.02})`,
          transition: 'opacity 150ms ease-out, transform 150ms ease-out',
        }}
        {...(!isPause ? { 'aria-live': 'polite' as const, 'aria-label': text } : {})}
      >
        {!isPause && (
          <FitText
            text={text}
            role="reading"
            className="select-none text-center font-medium text-foreground"
          />
        )}
      </div>
      <div className="flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'size-1.5 rounded-full',
              !prefersReducedMotion && 'transition-all duration-300',
              i <= sentenceIndex ? 'w-4 bg-foreground/60' : 'w-1.5 bg-muted-foreground/20',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Today's Topic — a premium card shown before the 5 sentences begin,
//    matching the brief's "Display: Today's Topic — Nature" beat. "Reading
//    Goal" reuses the chapter's own existing `mainIdea.correctIdea` field
//    (already authored for the Brain Challenge) rather than any new
//    dataset content — this is a presentation-only reuse of data that
//    already exists, not a schema change.

function TopicIntroCard({ chapter, prefersReducedMotion }: { chapter: SentenceChapter; prefersReducedMotion: boolean }): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex min-h-[220px] w-full flex-col items-center justify-center gap-5 text-center',
        !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-500',
      )}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/60 px-8 py-10 shadow-sm">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Today&apos;s Topic</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          {chapter.theme && `${THEME_EMOJI[chapter.theme]} `}{chapter.chapterTitle ?? 'This Chapter'}
        </p>
        <div className="mx-auto mt-6 h-px w-10 bg-border" aria-hidden="true" />
        <p className="mt-6 text-xs font-medium tracking-widest text-muted-foreground uppercase">Reading Goal</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {chapter.mainIdea?.correctIdea ?? 'Read carefully — real questions about this chapter follow.'}
        </p>
      </div>
    </div>
  )
}

// ── Level Map — always shown: ✔────●────○────○────○ / L1..L5

function LevelMap({ currentLevel }: { currentLevel: SentenceReadingLevel }): React.JSX.Element {
  const levels: SentenceReadingLevel[] = [1, 2, 3, 4, 5]
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

// ── Chapter progress — "Chapter N of 5" + a slim filled bar, a calmer,
//    more premium reading of the same `level` number the Level Map
//    already shows dot-by-dot. Purely presentational — no new state, no
//    change to what "level" means or how it's computed.

function ChapterProgressBar({ level }: { level: SentenceReadingLevel }): React.JSX.Element {
  return (
    <div className="flex w-32 flex-col items-center gap-1">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground">Chapter {level} of 5</p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted-foreground/15" role="progressbar" aria-valuenow={level} aria-valuemin={1} aria-valuemax={5} aria-label={`Chapter ${level} of 5`}>
        <div
          className="h-full rounded-full bg-foreground/70 transition-[width] duration-500 ease-out"
          style={{ width: `${(level / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ── Persistent HUD — always visible during 'playing'.

function LevelHud({ level }: { level: SentenceReadingLevel }): React.JSX.Element {
  const theme = SENTENCE_THEME_BY_LEVEL[level]
  return (
    <div className="absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-center">
      <p className="text-xs font-medium tabular-nums text-muted-foreground">Level {level} · {SENTENCE_THEME_NAME[theme]}</p>
      <LevelMap currentLevel={level} />
      <ChapterProgressBar level={level} />
      <p className="text-[10px] text-muted-foreground/70">
        Sentence Length: <span className="font-medium text-foreground/80">{SENTENCE_READING_LENGTH_LABEL[level]}</span>
      </p>
      <ReadingJourney currentStage="sentence" compact />
    </div>
  )
}

// ── Sentence Complexity — a distinct, top-right indicator (●○○○○-style),
//    separate from the centered Level Map above, using the brief's own
//    exact per-level words (Simple/Connected/Intermediate/Advanced/Expert).

function SentenceComplexityIndicator({ level }: { level: SentenceReadingLevel }): React.JSX.Element {
  const levels: SentenceReadingLevel[] = [1, 2, 3, 4, 5]
  return (
    <div
      className="absolute top-16 right-6 flex flex-col items-end gap-1"
      aria-label={`Sentence complexity: ${SENTENCE_COMPLEXITY_LABEL[level]}`}
    >
      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground/70">Sentence Complexity</p>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {levels.map((l) => (
          <span key={l} className={cn('text-xs', l <= level ? 'text-foreground' : 'text-muted-foreground/40')}>
            {l <= level ? '●' : '○'}
          </span>
        ))}
      </div>
      <p className="text-[10px] font-medium text-foreground/80">{SENTENCE_COMPLEXITY_LABEL[level]}</p>
    </div>
  )
}

// ── Session — everything between Mission Ready and Mission Complete. A
//    fresh instance per session (keyed by sessionKey in the parent).

type QuestionSubPhase = 'response' | 'feedback'
type SessionSubPhase = 'topicIntro' | 'reading' | 'pause' | 'question' | 'passScreen' | 'failScreen'

type EvalData = {
  level: SentenceReadingLevel
  percent: number
  requiredPercent: number
  passed: boolean
}

function SentenceReadingSession({
  tier,
  totalSessions,
  onRestart,
  seed,
  assetPool,
  exitHref,
  onComplete,
}: {
  tier: DifficultyTier
  totalSessions: number
  onRestart: () => void
  seed: number
  // QSR-ENGINE-SWAP-1 — additive, optional. When supplied (real
  // per-document chapters), every level draws from this same real pool
  // instead of SENTENCE_CHAPTERS — the standalone Lab's hardcoded
  // per-level path is completely untouched when absent.
  assetPool?: readonly SentenceChapter[]
  exitHref?: string
  onComplete?: (result: RuntimeResult) => void
}): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const router = useRouter()
  const curriculumSession = useCurriculumSessionCompletion('sentence-reading', LAB_HREF)
  const resolvedExitHref = exitHref ?? LAB_HREF
  const startingLevel = sentenceReadingLevel(tier)
  const startingProfile = getSentenceReadingProfile(tier)

  // ── One chapter per level attempt — fully resolved upfront, never
  //    grown mid-attempt ────────────────────────────────────────────────
  // `seed` is server-generated (see page.tsx) and passed down as a prop so
  // the very first render is identical between SSR and hydration — a bare
  // `Date.now()` here previously ticked between the server render and the
  // client's hydration render, causing a hydration-mismatch crash.
  const sessionSeedRef = useRef(seed)
  const chapterGenerationCountRef = useRef(0)
  const usedChapterIdsRef = useRef(new Set<string>())

  const fetchChapterForLevel = useCallback((level: SentenceReadingLevel): ChapterBlock | null => {
    const roundTier = SENTENCE_READING_LEVEL_DEFAULT_TIER[level]
    const genSeed = sessionSeedRef.current + chapterGenerationCountRef.current * 104729
    chapterGenerationCountRef.current += 1

    const chapter = assetPool !== undefined
      ? getChapterFromPool(assetPool, usedChapterIdsRef.current, genSeed)
      : getChapterForLevel(level, usedChapterIdsRef.current, genSeed)
    // QSR-ENGINE-SWAP-1 — filter to only the types this exact chapter can
    // honestly support BEFORE sampling, so a real-document chapter (which
    // only ever supports 'sequence') doesn't waste picks on unsupported
    // types and end up with an empty round. No-op for hardcoded chapters
    // (every type is always supported there).
    const usableTypes = resolveUsableSentenceChallengeTypes(chapter, SENTENCE_CHALLENGE_TYPES)
    const requestedTypes = pickItems(usableTypes, Math.min(4, usableTypes.length), genSeed + 40009)
    const built = buildChapterChallenges(chapter, requestedTypes, genSeed)
    if (built.questions.length === 0) return null

    usedChapterIdsRef.current.add(chapter.id)
    return { tier: roundTier, chapter, questions: built.questions, challenges: built.challenges }
  }, [assetPool])

  const [blocks, setBlocks] = useState<ChapterBlock[]>(() => {
    const first = fetchChapterForLevel(startingLevel)
    return first ? [first] : []
  })
  const [currentLevel, setCurrentLevel] = useState<SentenceReadingLevel>(startingLevel)

  const highestLevelThisSession = useRef<SentenceReadingLevel>(startingLevel)
  const passedAnyLevelThisSessionRef = useRef(false)

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
      labId: SENTENCE_READING_DEFINITION.labId,
      exerciseId: SENTENCE_READING_DEFINITION.id,
      durationMs: Math.max(1, result.metrics.sessionDurationMs),
      completed: result.metrics.accuracyPercent >= SENTENCE_READING_DEFINITION.adaptiveRules.minAccuracyToComplete,
    })
  }, [])

  const runtime = useUniversalExerciseRuntime({
    definition: SENTENCE_READING_DEFINITION,
    items,
    nextExerciseHref: NEXT_EXERCISE_HREF,
    onSessionComplete,
  })

  const floorMs = prefersReducedMotion ? MIN_SENTENCE_DISPLAY_MS_REDUCED_MOTION : MIN_SENTENCE_DISPLAY_MS

  const [subPhase, setSubPhase] = useState<SessionSubPhase>('topicIntro')
  const [questionSelectedIndex, setQuestionSelectedIndex] = useState<number | null>(null)
  const [questionSubPhase, setQuestionSubPhase] = useState<QuestionSubPhase>('response')
  const [evalData, setEvalData] = useState<EvalData | null>(null)
  const isVictoryRevealed = useMicroVictoryReveal(1500, evalData?.level)
  // Sprint-16 — Delight Layer™. See ProgressiveChunkReadingExperience.tsx
  // for the full rationale — computeLevelCoachLine below keeps reading the
  // raw evalData.percent, never this animated value.
  const animatedPercent = useCountUp(evalData?.percent ?? 0, 700, prefersReducedMotion)
  const questionStartTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptResponsesRef = useRef<ItemResponse[]>([])
  const sessionResponsesRef = useRef<ItemResponse[]>([]) // whole-session log, across every attempt — Best Streak needs this
  const leveledUpThisSessionRef = useRef(false)

  // A response answered on the LAST question of a level attempt is held
  // here until the learner clicks Continue/Try Again — the Pass/Fail
  // screen must render on stale `items` before the next chapter grows it.
  const pendingEvalResponseRef = useRef<ItemResponse | null>(null)

  // Growing `blocks` at the Continue/Try-Again boundary means
  // `runtime.recordResponse` must be called with a closure that has
  // already seen the new, longer `items` array — calling it in the same
  // tick as the `setBlocks()` that grows it would still use the stale
  // (shorter) closure, and the runtime would think the session ended
  // after the LAST item of the just-finished chapter instead of
  // continuing into the newly-added next chapter. Recording is deferred
  // exactly one render via this ref + a version counter that forces the
  // effect below to re-run once the growth has landed — the same pattern
  // this mission's engine used before growth was mostly retired within a
  // single chapter attempt; it's still required at this one remaining
  // growth point.
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
  const currentBlockProfile = currentBlock ? getSentenceReadingProfile(currentBlock.tier) : startingProfile
  const currentItem = items[runtime.currentIndex] ?? null
  const levelRequirement = getSentenceLevelRequirement(currentLevel)

  // "Today's Topic" title card — a fixed beat, not user-driven. Must only
  // start counting once the mission is actually 'playing' — subPhase is
  // already 'topicIntro' from initial mount, which happens during the
  // 'idle'/'countdown' phases too; gating on runtime.phase here stops the
  // timer firing (and skipping the card entirely) before the learner ever
  // sees the 'playing' UI.
  useEffect(() => {
    if (subPhase !== 'topicIntro' || runtime.phase !== 'playing') return
    const introTimer = setTimeout(() => setSubPhase('reading'), TOPIC_INTRO_MS)
    return () => clearTimeout(introTimer)
  }, [subPhase, currentBlockIndex, runtime.phase])

  const handleReadingComplete = useCallback((): void => {
    setSubPhase('pause')
  }, [])

  // The mandatory brain-pause beat — a blank canvas held for
  // BRAIN_PAUSE_MS before the Brain Challenge mounts. `questionStartTimeRef`
  // resets only once the question phase itself begins, so the deliberate
  // pause is never counted as part of the learner's measured reaction time.
  useEffect(() => {
    if (subPhase !== 'pause') return
    const pauseTimer = setTimeout(() => {
      setSubPhase('question')
      questionStartTimeRef.current = Date.now()
    }, BRAIN_PAUSE_MS)
    return () => clearTimeout(pauseTimer)
  }, [subPhase])

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
      attemptResponsesRef.current.push(response)

      const isLastQuestionOfChapter = currentQuestionIndex + 1 >= currentBlock.questions.length

      if (!isLastQuestionOfChapter) {
        // More questions remain in THIS chapter's Brain Challenge — all 4
        // were built together upfront and already live in `items`, so no
        // growth is needed.
        questionStartTimeRef.current = Date.now()
        runtime.recordResponse(response)
        return
      }

      // Last question of the chapter's Brain Challenge — evaluate, but do
      // NOT record the response or grow `blocks` yet. The Pass/Fail
      // screen waits for an explicit Continue/Try Again click.
      const correctCount = attemptResponsesRef.current.filter((r) => r.isCorrect).length
      const totalCount = attemptResponsesRef.current.length
      const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
      const passed = computeSentenceLevelPassed(percent, levelRequirement.requiredPercent)
      if (passed) passedAnyLevelThisSessionRef.current = true
      pendingEvalResponseRef.current = response
      setEvalData({ level: currentLevel, percent, requiredPercent: levelRequirement.requiredPercent, passed })
      setSubPhase(passed ? 'passScreen' : 'failScreen')
    }, FEEDBACK_MS)
  }

  function beginNextAttempt(level: SentenceReadingLevel): void {
    const response = pendingEvalResponseRef.current
    if (response === null) return
    pendingEvalResponseRef.current = null

    const nextChapter = fetchChapterForLevel(level)
    if (nextChapter === null) {
      // Pool exhausted — never fabricate; end gracefully here.
      runtime.recordResponse(response)
      return
    }

    setCurrentLevel(level)
    if (level > highestLevelThisSession.current) highestLevelThisSession.current = level
    attemptResponsesRef.current = []
    setEvalData(null)
    pendingResponseRef.current = response
    setBlocks((prev) => [...prev, nextChapter])
    setPendingResponseVersion((v) => v + 1)
    setSubPhase('topicIntro')
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
    beginNextAttempt((evalData.level + 1) as SentenceReadingLevel)
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
    const nextLevel = sentenceReadingLevel(nextTier)
    const flashXpEarned = computeFlashXp(result.metrics.performanceScore, result.metrics.totalCount)
    const brainPerformance = computeBrainPerformanceLabel(result.metrics.accuracyPercent)
    const bestStreak = computeBestStreak(sessionResponsesRef.current)
    const levelsCompleted = highestLevelThisSession.current
    const rhythm = computeIdeaProcessingRhythm(result.metrics.accuracyPercent, levelRequirement.requiredPercent, leveledUpThisSessionRef.current)
    const achievement = computeTodaysAchievement({ leveledUpThisSession: leveledUpThisSessionRef.current, rhythm })
    const themeMastery = computeThemeMastery(SENTENCE_THEME_NAME[SENTENCE_THEME_BY_LEVEL[levelsCompleted]], passedAnyLevelThisSessionRef.current)

    return { promoted: progression.shouldPromote, recovered: recovery.shouldRecover, nextLevel, flashXpEarned, brainPerformance, bestStreak, levelsCompleted, rhythm, achievement, themeMastery }
  }, [result, tier, totalSessions, levelRequirement.requiredPercent])

  let extraStats: RuntimeResultExtraStat[] = []
  let coachMessage = ''
  let extraContent: React.ReactNode = null

  if (result !== null && completedSummary !== null) {
    const recommendation = buildSentenceReadingRecommendation({
      accuracyPercent: result.metrics.accuracyPercent,
      rhythm: completedSummary.rhythm,
      sentenceDescriptor: levelPhraseDescriptor(highestLevelThisSession.current),
      nextSentenceDescriptor: levelPhraseDescriptor(completedSummary.nextLevel),
      promoted: completedSummary.promoted,
      recovered: completedSummary.recovered,
      seed: runtime.currentIndex + tier.length,
    })
    coachMessage = recommendation.coachParagraph

    extraStats = [
      { label: 'Brain Performance', value: completedSummary.brainPerformance, hint: 'How reliably you recognised each chapter\'s central idea.' },
      { label: 'Idea Recognition', value: `${result.metrics.accuracyPercent}%`, hint: 'The share of Brain Challenges answered correctly.' },
      { label: 'Best Streak', value: `${completedSummary.bestStreak}`, hint: 'Your longest run of consecutive correct answers this session.' },
      { label: 'Current Level', value: `${completedSummary.levelsCompleted} · ${SENTENCE_READING_LEVEL_NAME[completedSummary.levelsCompleted]}`, hint: 'The highest level you reached this session.' },
      { label: 'Theme Mastery', value: completedSummary.themeMastery, hint: "This session's theme and whether it was fully cleared." },
    ]

    extraContent = (
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="text-base tracking-widest text-foreground" aria-label={`${completedSummary.levelsCompleted} out of 5 stars`}>
          {starRatingFromAccuracy(result.metrics.accuracyPercent)}
        </p>
        <p>{completedSummary.achievement}</p>
        <p>Next Recommendation: <span className="font-medium text-foreground">{SENTENCE_READING_LEVEL_NAME[completedSummary.nextLevel]}</span></p>
      </div>
    )
  }

  const notifiedResultRef = useRef<RuntimeResult | null>(null)
  useEffect(() => {
    if (result === null || completedSummary === null || notifiedResultRef.current === result) return
    notifiedResultRef.current = result
  }, [result, completedSummary])

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {(runtime.phase === 'playing' || runtime.phase === 'paused') && (
        <>
          <LevelHud level={currentLevel} />
          <SentenceComplexityIndicator level={currentLevel} />
        </>
      )}

      <button
        onClick={() => { clearTimer(); router.push(getCurriculumSmartExitHref('sentence-reading', resolvedExitHref)) }}
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

      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        {runtime.phase === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <ReadingJourney currentStage="sentence" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sentence Reading™</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Read a themed chapter of complete sentences, then recognise the whole idea — a premium reading lesson, not a flash card.
            </p>
            <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-left text-xs">
              <dt className="text-muted-foreground">Today&apos;s Goal</dt>
              <dd className="font-medium text-foreground">Understand Complete Ideas</dd>
              <dt className="text-muted-foreground">Level</dt>
              <dd className="font-medium text-foreground">{startingLevel} · {SENTENCE_READING_LEVEL_NAME[startingLevel]}</dd>
              <dt className="text-muted-foreground">Today&apos;s Topic</dt>
              <dd className="font-medium text-foreground">{THEME_EMOJI[SENTENCE_THEME_BY_LEVEL[startingLevel]]} {SENTENCE_THEME_NAME[SENTENCE_THEME_BY_LEVEL[startingLevel]]}</dd>
              <dt className="text-muted-foreground">Sentence Length</dt>
              <dd className="font-medium text-foreground">{SENTENCE_READING_LENGTH_LABEL[startingLevel]}</dd>
              <dt className="text-muted-foreground">Mission</dt>
              <dd className="font-medium text-foreground">1 Chapter · 5 Sentences</dd>
              <dt className="text-muted-foreground">Brain Target</dt>
              <dd className="font-medium text-foreground">Idea Processing</dd>
            </dl>
            <p className="text-xs text-muted-foreground/70">
              Level {startingLevel} needs {getSentenceLevelRequirement(startingLevel).requiredPercent}% correct{totalSessions > 0 ? ` · Mission ${totalSessions + 1}` : ''}
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
                className={cn('flex min-h-[280px] flex-col items-center justify-center gap-3 text-center', !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-400')}
                role="status"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-success/10" aria-hidden="true">
                  <span className="text-2xl font-bold tabular-nums text-success">{Math.round(animatedPercent)}%</span>
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">Chapter {evalData.level} Complete</h2>
                <p className="text-sm font-medium text-muted-foreground">{computeLevelCoachLine(evalData.percent)}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {evalData.level < 5 ? `🔓 Level ${evalData.level + 1}` : '🏆 All Levels Cleared'}
                </p>
                <button
                  onClick={handleContinue}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {evalData.level < 5 ? 'Continue →' : 'View Results →'}
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
                <p className="text-xs text-muted-foreground">{computeLevelCoachLine(evalData.percent)}</p>
                <button
                  onClick={handleTryAgain}
                  className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Retry →
                </button>
              </div>
            )}
            {subPhase === 'topicIntro' && currentBlock && (
              <TopicIntroCard chapter={currentBlock.chapter} prefersReducedMotion={prefersReducedMotion} />
            )}
            {subPhase === 'reading' && currentBlock && (
              <ChapterReadingBlock
                key={currentBlockIndex}
                chapter={currentBlock.chapter}
                msPerWord={currentBlockProfile.msPerWord}
                floorMs={floorMs}
                prefersReducedMotion={prefersReducedMotion}
                onComplete={handleReadingComplete}
              />
            )}
            {/* The mandatory beat between the last sentence fading away and
                the Brain Challenge appearing — unchanged in duration
                (BRAIN_PAUSE_MS), now filled with a brief premium
                transition card instead of a blank canvas, holding the
                same layout height so nothing jumps. */}
            {subPhase === 'pause' && (
              <div
                className={cn(
                  'flex min-h-[280px] w-full flex-col items-center justify-center gap-1.5 text-center',
                  !prefersReducedMotion && 'animate-in fade-in duration-200',
                )}
                aria-live="polite"
              >
                <p className="text-lg font-semibold tracking-tight text-foreground">Brain Challenge</p>
                <p className="text-xs text-muted-foreground">Let&apos;s see what you understood.</p>
              </div>
            )}
            {subPhase === 'question' && currentItem && currentChallenge && (
              <div className={cn('flex w-full flex-col items-center gap-4', !prefersReducedMotion && 'animate-in fade-in duration-300')}>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Brain Challenge</p>
                <ChoiceGrid
                  options={currentItem.options}
                  correctIndex={currentItem.correctIndex}
                  onSelect={handleSelect}
                  selectedIndex={questionSelectedIndex}
                  isFeedback={questionSubPhase === 'feedback'}
                  disabled={questionSubPhase !== 'response'}
                  promptLabel={currentChallenge.prompt}
                />
                {/* Positive-only feedback microcopy — never "Wrong" or
                    "Incorrect" anywhere in this mission. */}
                <div className="h-5" aria-live="polite">
                  {questionSubPhase === 'feedback' && questionSelectedIndex !== null && (
                    <p className={cn(
                      'text-sm font-medium',
                      questionSelectedIndex === currentItem.correctIndex ? 'text-success' : 'text-muted-foreground',
                    )}>
                      {questionSelectedIndex === currentItem.correctIndex
                        ? POSITIVE_FEEDBACK_LINES[runtime.currentIndex % POSITIVE_FEEDBACK_LINES.length]
                        : KEEP_BUILDING_LINE}
                    </p>
                  )}
                </div>
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
          exerciseName={SENTENCE_READING_DEFINITION.title}
          trainsAbility={SENTENCE_READING_DEFINITION.trainsAbility}
          result={result}
          labHref={getWizardAwareBackHref('sentence-reading', LAB_HREF)}
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

// ── Outer component — session bookkeeping (tier, restart). Content
//    generation lives entirely inside the inner Session component, since
//    it happens reactively as levels are earned rather than all upfront.

type SentenceReadingExperienceProps = {
  // Generated once per request by the Server Component in page.tsx — kept
  // stable across the SSR render and the client hydration render.
  initialSeed: number
  // QSR-ENGINE-SWAP-1 — additive, optional real-document integration seam,
  // mirroring ProgressiveChunkReadingExperience's own contentPool?/exitHref?/
  // onComplete? seam (Sprint QSR-2.6) exactly. Absent (standalone Lab):
  // unchanged hardcoded behavior.
  assetPool?: readonly SentenceChapter[]
  exitHref?: string
  onComplete?: (result: RuntimeResult) => void
}

export function SentenceReadingExperience({ initialSeed, assetPool, exitHref, onComplete }: SentenceReadingExperienceProps): React.JSX.Element {
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
    <SentenceReadingSession
      key={sessionKey}
      tier={state.currentDifficultyTier}
      totalSessions={state.sessionCount}
      onRestart={handleRestart}
      seed={initialSeed + sessionKey * 999983}
      {...(assetPool !== undefined ? { assetPool } : {})}
      {...(exitHref !== undefined ? { exitHref } : {})}
      {...(onComplete !== undefined ? { onComplete } : {})}
    />
  )
}
