'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useMemoryDiscoverySession } from '@/features/memory-discovery/useMemoryDiscoverySession'
import { MEMORY_DISCOVERY_SCENES } from '@/features/memory-discovery/types'
import type { ChoiceQuestion } from '@/features/memory-discovery/types'
import { SCENE_TO_MISSION, type MemoryMissionId } from '@/features/memory-discovery/memoryMissions'
import { createMemoryContentSession } from '@/features/memory-discovery/loadContent'
import { overlapRatio, type MemoryProfileSignals } from '@/features/memory-discovery/memoryProfile'
import { computeMemoryIntelligenceReport } from '@/features/memory-discovery/memoryIntelligenceEngine'
import { AdaptiveMemoryCoach } from '@/features/memory-discovery/adaptiveMemoryCoach'
import { pickAdaptiveEncouragement } from '@/features/memory-discovery/pickAdaptiveEncouragement'
import { imageInsight, numberInsight, patternInsight, sentenceInsight, shapeInsight, visualInsight, wordInsight } from '@/features/memory-discovery/microInsights'
import { perItemFlashMs, verbalFlashMs } from '@/features/memory-discovery/flashSpeed'
import { computeReadingSpeedMultiplier } from '@/features/memory-discovery/adaptiveTiming'
import { HESITATION_THRESHOLD_MS } from '@/features/memory-discovery/memoryTimingConfig'
import { getRecentlyShownContentIds, recordShownContentIds } from '@/features/memory-discovery/recentContentHistory'
import { getLastReadingSpeed } from '@/features/discover-learning-potential/readingSpeedHandoff'
import type { DigitSpanRound } from '@/features/memory-discovery/digitSpan'
import type { PatternSequenceRound } from '@/features/memory-discovery/patternSequence'
import type { DigitSpanResult } from './DigitSpanCard'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { WelcomeCard } from './WelcomeCard'
import { MissionIntroCard } from './MissionIntroCard'
import { MissionCompleteCard } from './MissionCompleteCard'
import { MissionCuriosityLoop } from './MissionCuriosityLoop'
import { SequentialFlashCard } from './SequentialFlashCard'
import { MultiSelectRecallCard } from './MultiSelectRecallCard'
import { SingleChoiceCard } from './SingleChoiceCard'
import { MicroInsightCard } from './MicroInsightCard'
import { DigitSpanCard } from './DigitSpanCard'
import { MemoryDiscoveryReportCard } from './MemoryDiscoveryReportCard'

// Every answer gets this long to register visually before the screen
// changes — brief enough that the flow never waits on the user pressing
// anything else.
const OPTION_AUTO_ADVANCE_DELAY_MS = 200
// Adaptive Memory Coach™ (Sprint-3) — the real, disclosed threshold past
// which a real recall-grid overlap reads as "handled well" for the
// coach's own confidence model. Deliberately stricter than the profile
// engine's own 0.34 "something was captured" threshold — this one
// decides whether to make the NEXT real challenge richer, not just
// whether to phrase an insight positively.
const COACH_CORRECT_THRESHOLD = 0.5

const EXERCISE_ID = 'memory-discovery'

type UiPhase = 'welcome' | 'mission-intro' | 'in-mission' | 'mission-complete' | 'curiosity-loop' | 'profile'

// Recognition & Recall spans three real content types generated together
// the moment that Mission starts.
type RecognitionMissionContent = {
  sentence: string
  sentenceQuestion: ChoiceQuestion
  imageSceneTitle: string
  imageItems: readonly string[]
  imageChoices: readonly string[]
  shapeItems: readonly string[]
  shapeChoices: readonly string[]
}

type MissionContentCache = {
  visual?: { items: readonly string[]; choices: readonly string[] }
  number?: { rounds: readonly DigitSpanRound[] }
  word?: { items: readonly string[]; choices: readonly string[] }
  pattern?: { round: PatternSequenceRound; question: ChoiceQuestion }
  recognition?: RecognitionMissionContent
}

// Memory Discovery Foundation™ (Sprint-1) through Adaptive Memory Coach™
// (Sprint-3) — restructures the six-experiment flow into the locked
// 5-Mission journey (Visual → Number → Word → Pattern & Sequence →
// Recognition & Recall). `sceneIndex` still walks the real
// `MEMORY_DISCOVERY_SCENES` array exactly as before. `uiPhase` is the
// outer layer that inserts a real Mission Intro before each mission's
// first scene and a real Mission Complete beat after its last, with a
// short Curiosity Loop bridging into the next mission.
//
// Sprint-3 — "Two users should never receive exactly the same Memory
// Discovery experience... every completed challenge should influence the
// next one." Content used to be computed entirely upfront, at mount,
// before a single real challenge had happened — structurally incapable
// of reacting to the session. It's now generated LAZILY, one mission at
// a time, via `createMemoryContentSession` — each mission's own content
// is only ever requested right before that mission starts
// (`ensureMissionContent`, called from `handleMissionReady`), using
// whatever real `MemoryDifficultyAdjustment` the `AdaptiveMemoryCoach™`
// has computed from every real mission completed so far. The coach
// itself is fed real outcomes from every mission's own answer handler
// (`recordOutcome`) plus real hesitation (`recordHesitation`, a real
// reaction-time threshold) — never exposed in the UI (FIX-09).
//
// Every flash moment is rendered by the platform's actual Flash Engine
// primitives — FlashStimulus (per-item hold), choreographed one item at
// a time by SequentialFlashCard — never a bespoke timer, never every
// item shown at once.
export function MemoryDiscoveryExperience(): React.JSX.Element {
  const router = useRouter()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [uiPhase, setUiPhase] = useState<UiPhase>('welcome')
  const { enterScene, recordSceneExit, recordOptionResponse, recordRecallResponse, recordDigitSpanResult, submitSession } = useMemoryDiscoverySession()

  const tier = useMemo(() => loadState(EXERCISE_ID).currentDifficultyTier, [])
  // Read once, before this session's own picks are made — recording
  // happens after, so a session never excludes its own content.
  const recentIds = useMemo(() => getRecentlyShownContentIds(), [])
  // Sprint-3 — one real, stateful content session for the whole run
  // (shared exclusion Sets across missions) plus one real Adaptive
  // Memory Coach™ instance, both created once and never replaced.
  const contentSessionRef = useRef(createMemoryContentSession(tier, recentIds))
  const coachRef = useRef(new AdaptiveMemoryCoach())
  const missionContentRef = useRef<MissionContentCache>({})
  // Sprint-2.1 FIX-03 — Reading-Speed Awareness: a real, invisible,
  // session-wide multiplier computed once from Reading Discovery's own
  // real last measured speed (`null` — and so a neutral 1× — when that
  // data is unavailable, e.g. a first-time visitor). Never exposed in
  // the UI; only ever applied underneath to real observation durations.
  const readingSpeedMultiplier = useMemo(() => computeReadingSpeedMultiplier(getLastReadingSpeed()), [])
  const flashMs = useMemo(() => perItemFlashMs(tier, readingSpeedMultiplier), [tier, readingSpeedMultiplier])
  // Sprint-1.6 FIX-12 — real text content (words, sentences, scene object
  // labels) gets a real, modest "comfortable reading pace" on top of the
  // shared fast-observation rate; pure glyph content (icons, shapes,
  // digits) stays at the base pace.
  const verbalMs = useMemo(() => verbalFlashMs(tier, readingSpeedMultiplier), [tier, readingSpeedMultiplier])

  const signalsRef = useRef<MemoryProfileSignals>({
    visualRatio: 0,
    wordRatio: 0,
    patternAccuracy: 0,
    imageRatio: 0,
    shapeRatio: 0,
    sentenceExact: false,
    numberExact: false,
  })
  // Sprint-2 — the Memory Intelligence Engine™ needs the real, rich
  // Digit Span™ result (accuracy ratio, real rounds completed), not just
  // the single derived `numberExact` boolean `MemoryProfileSignals` still
  // carries for the existing per-mission micro-insight (Sprint-1.6).
  const digitSpanResultRef = useRef<DigitSpanResult>({ roundsCompleted: 0, correctCount: 0, longestCorrectLength: 0, totalRecognitionMs: 0 })
  // Sprint-3 FIX-01 — the moment the CURRENT real recall/choice scene
  // began, so every answer handler can compute a real reaction time for
  // the coach (hesitation + evidence), without a second, parallel timer.
  const itemPresentedAtRef = useRef(Date.now())

  const scene = MEMORY_DISCOVERY_SCENES[sceneIndex]!

  // Real dwell-time tracking only ever starts once a real tracked scene
  // is actually on screen — never while a Mission Intro/Complete/
  // Curiosity beat sits in front of it (mirrors Reading Discovery's own
  // identical `phase`-gated `enterScene` call).
  useEffect(() => {
    if (uiPhase === 'welcome' || uiPhase === 'in-mission' || uiPhase === 'profile') {
      enterScene(scene)
      itemPresentedAtRef.current = Date.now()
    }
  }, [uiPhase, scene, enterScene])

  // Sprint-3 FIX-02/FIX-06 — generates ONE mission's own real content the
  // moment it's actually needed (idempotent — a mission's content is
  // only ever generated once), reading whatever real
  // `MemoryDifficultyAdjustment` the coach has computed from every real
  // mission completed so far.
  const ensureMissionContent = useCallback((mission: MemoryMissionId): void => {
    if (missionContentRef.current[mission] !== undefined) return
    const adjustment = coachRef.current.getDifficultyAdjustment()
    const session = contentSessionRef.current
    if (mission === 'visual') missionContentRef.current.visual = session.loadVisualMemory(adjustment)
    else if (mission === 'number') missionContentRef.current.number = session.loadNumberMemory(adjustment)
    else if (mission === 'word') missionContentRef.current.word = session.loadWordMemory(adjustment)
    else if (mission === 'pattern') missionContentRef.current.pattern = session.loadPatternSequence(adjustment)
    else {
      const sentenceResult = session.loadSentenceRecall()
      const imageResult = session.loadImageRecall(adjustment)
      const shapeResult = session.loadShapeRecognition(adjustment)
      missionContentRef.current.recognition = {
        sentence: sentenceResult.sentence,
        sentenceQuestion: sentenceResult.question,
        imageSceneTitle: imageResult.sceneTitle,
        imageItems: imageResult.items,
        imageChoices: imageResult.choices,
        shapeItems: shapeResult.items,
        shapeChoices: shapeResult.choices,
      }
    }
  }, [])

  const handleWelcomeBegin = useCallback((): void => {
    recordSceneExit('welcome')
    setSceneIndex(1)
    ensureMissionContent('visual')
    setUiPhase('mission-intro')
  }, [recordSceneExit, ensureMissionContent])

  const advance = useCallback((): void => {
    recordSceneExit(scene)
    const nextIndex = Math.min(sceneIndex + 1, MEMORY_DISCOVERY_SCENES.length - 1)
    const nextScene = MEMORY_DISCOVERY_SCENES[nextIndex]!
    setSceneIndex(nextIndex)
    // Sprint-1 FIX-01/FIX-04 — "Every mission should feel like the next
    // chapter of one continuous journey." Crossing out of a Mission's
    // last real scene (into either the next Mission's first scene or the
    // closing profile) always surfaces a real Mission Complete beat first
    // — never a silent jump straight into the next mission.
    if (SCENE_TO_MISSION[scene] !== SCENE_TO_MISSION[nextScene]) {
      setUiPhase('mission-complete')
    }
  }, [scene, sceneIndex, recordSceneExit])

  const handleMissionReady = useCallback((): void => setUiPhase('in-mission'), [])

  const handleMissionCompleteContinue = useCallback((): void => {
    if (scene === 'learning-memory-profile') {
      setUiPhase('profile')
      return
    }
    // Sprint-3 — the NEXT real mission's content is generated here,
    // right as this beat ends, using the coach's real adjustment as it
    // stands at this exact moment (every prior mission's real outcome
    // already folded in).
    const nextMission = SCENE_TO_MISSION[scene]
    if (nextMission !== undefined) ensureMissionContent(nextMission)
    setUiPhase('curiosity-loop')
  }, [scene, ensureMissionContent])

  const handleCuriosityDone = useCallback((): void => setUiPhase('mission-intro'), [])

  // Sprint-3 FIX-01 — a real reaction time + real hesitation check,
  // shared by every answer handler below.
  const recordCoachOutcome = useCallback((wasCorrect: boolean): number => {
    const reactionMs = Date.now() - itemPresentedAtRef.current
    coachRef.current.recordOutcome(wasCorrect, reactionMs)
    if (reactionMs > HESITATION_THRESHOLD_MS) coachRef.current.recordHesitation()
    return reactionMs
  }, [])

  const handleRecallContinue = useCallback(
    (questionId: 'visual-memory' | 'word-memory' | 'image-recall' | 'shape-recognition', shown: readonly string[], selected: string[]): void => {
      recordRecallResponse(questionId, selected)
      const ratio = overlapRatio(shown, selected)
      if (questionId === 'visual-memory') signalsRef.current.visualRatio = ratio
      else if (questionId === 'word-memory') signalsRef.current.wordRatio = ratio
      else if (questionId === 'image-recall') signalsRef.current.imageRatio = ratio
      else signalsRef.current.shapeRatio = ratio
      recordCoachOutcome(ratio >= COACH_CORRECT_THRESHOLD)
      advance()
    },
    [recordRecallResponse, recordCoachOutcome, advance],
  )

  const handleSentenceSelect = useCallback(
    (optionId: string): void => {
      const recognition = missionContentRef.current.recognition!
      const label = recognition.sentenceQuestion.options.find((option) => option.id === optionId)?.label
      const wasExact = label === recognition.sentence
      signalsRef.current.sentenceExact = wasExact
      recordOptionResponse(recognition.sentenceQuestion.id, optionId)
      recordCoachOutcome(wasExact)
      window.setTimeout(advance, OPTION_AUTO_ADVANCE_DELAY_MS)
    },
    [recordOptionResponse, recordCoachOutcome, advance],
  )

  // Sprint-1.5 FIX-04 — real order-match: the chosen option's own real
  // label (a space-joined rendering of a full candidate order) either
  // matches the real sequence exactly or it doesn't — never a partial
  // ratio, since order either is or isn't correct.
  const handlePatternSelect = useCallback(
    (optionId: string): void => {
      const pattern = missionContentRef.current.pattern!
      const label = pattern.question.options.find((option) => option.id === optionId)?.label
      const wasCorrect = label === pattern.round.sequence.join(' ')
      signalsRef.current.patternAccuracy = wasCorrect ? 1 : 0
      recordOptionResponse(pattern.question.id, optionId)
      recordCoachOutcome(wasCorrect)
      window.setTimeout(advance, OPTION_AUTO_ADVANCE_DELAY_MS)
    },
    [recordOptionResponse, recordCoachOutcome, advance],
  )

  // Sprint-3 FIX-01/FIX-06 — fires the moment each real Digit Span™ round
  // is answered (well before the whole mission finishes), so the coach
  // gets real, continuous, round-by-round evidence.
  const handleDigitSpanRoundOutcome = useCallback((wasCorrect: boolean, reactionMs: number): void => {
    coachRef.current.recordOutcome(wasCorrect, reactionMs)
    if (reactionMs > HESITATION_THRESHOLD_MS) coachRef.current.recordHesitation()
  }, [])

  // Sprint-1.5 FIX-02/FIX-10 — Digit Span™ runs its own real multi-round
  // loop internally; this receives its final real, structured result
  // once every round is done. "Captured it overall" mirrors the old
  // two-number mode's own rule: at least half of the real rounds
  // answered correctly reads as a real captured signal, not a strict
  // all-or-nothing pass.
  const handleDigitSpanDone = useCallback(
    (result: DigitSpanResult): void => {
      recordDigitSpanResult(result)
      digitSpanResultRef.current = result
      signalsRef.current.numberExact = result.roundsCompleted > 0 && result.correctCount / result.roundsCompleted >= 0.5
      advance()
    },
    [recordDigitSpanResult, advance],
  )

  // Computed once, the moment the closing scene is reached — not on every
  // render — so the report stays stable for as long as it's on screen.
  // Sprint-2 — Memory Intelligence Engine™: real per-mission scores
  // (Number Memory uses its own real accuracy ratio, not just the
  // boolean; Recognition & Recall is the real average of its own three
  // real content types) feed one real, deterministic report. Sprint-3
  // FIX-08 — the coach's own real total-outcome count enriches the real
  // confidence calculation with broader, whole-session evidence.
  const report = useMemo(() => {
    if (scene !== 'learning-memory-profile') return null
    const signals = signalsRef.current
    const digitSpan = digitSpanResultRef.current
    return computeMemoryIntelligenceReport({
      visualScore: signals.visualRatio,
      numberScore: digitSpan.roundsCompleted > 0 ? digitSpan.correctCount / digitSpan.roundsCompleted : 0,
      wordScore: signals.wordRatio,
      patternScore: signals.patternAccuracy,
      recognitionScore: ((signals.sentenceExact ? 1 : 0) + signals.imageRatio + signals.shapeRatio) / 3,
      digitSpanRoundsCompleted: digitSpan.roundsCompleted,
      totalCoachOutcomes: coachRef.current.getEvidenceSummary().totalOutcomes,
    })
  }, [scene])

  const finish = useCallback((): void => {
    recordSceneExit(scene)
    // Every real mission's content has been generated by now — persist
    // the whole real session's shown ids once, here, so the next replay
    // can deprioritize them (Sprint-3 replaced the old "compute
    // everything upfront, persist once at mount" shape with lazy
    // per-mission generation, so this is the one point guaranteed to run
    // after all of it).
    recordShownContentIds(contentSessionRef.current.getShownContentIds())
    submitSession(true)
    // Discover Your Learning Potential™ — Sprint-1 Foundation. Continues
    // the real locked flow (Reading → Memory → Focus → AI Profile)
    // instead of returning to the root landing screen.
    router.push('/discover-learning-potential/focus')
  }, [scene, recordSceneExit, submitSession, router])

  // The Mission a Mission Complete/Curiosity Loop beat refers to: while
  // `uiPhase` is 'mission-complete', `scene`/`sceneIndex` have already
  // advanced past the Mission that just finished — its real last scene
  // sits one position back.
  const justCompletedMission = SCENE_TO_MISSION[MEMORY_DISCOVERY_SCENES[Math.max(0, sceneIndex - 1)]!]
  const currentMission = SCENE_TO_MISSION[scene]
  const visualContent = missionContentRef.current.visual
  const numberContent = missionContentRef.current.number
  const wordContent = missionContentRef.current.word
  const patternContent = missionContentRef.current.pattern
  const recognitionContent = missionContentRef.current.recognition

  return (
    <main className="bg-background">
      <AnimatePresence mode="wait">
        {uiPhase === 'welcome' && <WelcomeCard key="welcome" onBegin={handleWelcomeBegin} />}

        {uiPhase === 'mission-intro' && currentMission !== undefined && (
          <MissionIntroCard key={`mission-intro-${currentMission}`} mission={currentMission} onReady={handleMissionReady} />
        )}

        {uiPhase === 'mission-complete' && justCompletedMission !== undefined && (
          <MissionCompleteCard
            key={`mission-complete-${justCompletedMission}`}
            mission={justCompletedMission}
            onContinue={handleMissionCompleteContinue}
            adaptiveEncouragement={pickAdaptiveEncouragement(coachRef.current)}
          />
        )}

        {uiPhase === 'curiosity-loop' && currentMission !== undefined && (
          <MissionCuriosityLoop key={`curiosity-${currentMission}`} nextMission={currentMission} onDone={handleCuriosityDone} />
        )}

        {uiPhase === 'in-mission' && (
          <>
            {scene === 'visual-memory-display' && visualContent !== undefined && (
              <SequentialFlashCard
                key="visual-memory-display"
                instruction="Notice naturally."
                items={visualContent.items}
                perItemMs={flashMs}
                textClassName="text-foreground text-6xl sm:text-7xl"
                onDone={advance}
              />
            )}
            {scene === 'visual-memory-recall' && visualContent !== undefined && (
              <MultiSelectRecallCard
                key="visual-memory-recall"
                prompt="What stayed in your memory?"
                choices={visualContent.choices}
                onContinue={(selected) => handleRecallContinue('visual-memory', visualContent.items, selected)}
              />
            )}
            {scene === 'visual-memory-insight' && (
              <MicroInsightCard key="visual-memory-insight" lines={[visualInsight(signalsRef.current.visualRatio)]} onDone={advance} />
            )}

            {scene === 'number-memory-display' && numberContent !== undefined && (
              <DigitSpanCard
                key="number-memory-display"
                rounds={numberContent.rounds}
                onDone={handleDigitSpanDone}
                onRoundOutcome={handleDigitSpanRoundOutcome}
                adaptiveMultiplier={readingSpeedMultiplier}
              />
            )}
            {scene === 'number-memory-insight' && (
              <MicroInsightCard key="number-memory-insight" lines={[numberInsight(signalsRef.current.numberExact)]} onDone={advance} />
            )}

            {scene === 'word-memory-display' && wordContent !== undefined && (
              <SequentialFlashCard
                key="word-memory-display"
                instruction="Trust first memory."
                items={wordContent.items}
                perItemMs={verbalMs}
                onDone={advance}
              />
            )}
            {scene === 'word-memory-recall' && wordContent !== undefined && (
              <MultiSelectRecallCard
                key="word-memory-recall"
                prompt="What words do you remember?"
                choices={wordContent.choices}
                onContinue={(selected) => handleRecallContinue('word-memory', wordContent.items, selected)}
              />
            )}
            {scene === 'word-memory-insight' && (
              <MicroInsightCard key="word-memory-insight" lines={[wordInsight(signalsRef.current.wordRatio)]} onDone={advance} />
            )}

            {scene === 'pattern-sequence-display' && patternContent !== undefined && (
              <SequentialFlashCard
                key="pattern-sequence-display"
                instruction="Notice the order."
                items={patternContent.round.sequence}
                perItemMs={flashMs}
                textClassName="text-foreground text-6xl sm:text-7xl"
                onDone={advance}
              />
            )}
            {scene === 'pattern-sequence-choice' && patternContent !== undefined && (
              <SingleChoiceCard key="pattern-sequence-choice" question={patternContent.question} onSelect={handlePatternSelect} />
            )}
            {scene === 'pattern-sequence-insight' && (
              <MicroInsightCard key="pattern-sequence-insight" lines={[patternInsight(signalsRef.current.patternAccuracy === 1)]} onDone={advance} />
            )}

            {scene === 'sentence-recall-display' && recognitionContent !== undefined && (
              <SequentialFlashCard key="sentence-recall-display" items={recognitionContent.sentence.split(' ')} perItemMs={verbalMs} onDone={advance} />
            )}
            {scene === 'sentence-recall-choice' && recognitionContent !== undefined && (
              <SingleChoiceCard key="sentence-recall-choice" question={recognitionContent.sentenceQuestion} onSelect={handleSentenceSelect} />
            )}
            {scene === 'sentence-recall-insight' && (
              <MicroInsightCard
                key="sentence-recall-insight"
                lines={[sentenceInsight(signalsRef.current.sentenceExact)]}
                onDone={advance}
              />
            )}

            {scene === 'image-recall-display' && recognitionContent !== undefined && (
              <SequentialFlashCard key="image-recall-display" items={recognitionContent.imageItems} perItemMs={verbalMs} onDone={advance} />
            )}
            {scene === 'image-recall-choice' && recognitionContent !== undefined && (
              <MultiSelectRecallCard
                key="image-recall-choice"
                prompt="What do you remember seeing?"
                choices={recognitionContent.imageChoices}
                onContinue={(selected) => handleRecallContinue('image-recall', recognitionContent.imageItems, selected)}
              />
            )}
            {scene === 'image-recall-insight' && (
              <MicroInsightCard key="image-recall-insight" lines={[imageInsight(signalsRef.current.imageRatio)]} onDone={advance} />
            )}

            {scene === 'shape-recognition-display' && recognitionContent !== undefined && (
              <SequentialFlashCard
                key="shape-recognition-display"
                instruction="Notice naturally."
                items={recognitionContent.shapeItems}
                perItemMs={flashMs}
                textClassName="text-foreground text-6xl sm:text-7xl"
                onDone={advance}
              />
            )}
            {scene === 'shape-recognition-choice' && recognitionContent !== undefined && (
              <MultiSelectRecallCard
                key="shape-recognition-choice"
                prompt="What did you see?"
                choices={recognitionContent.shapeChoices}
                onContinue={(selected) => handleRecallContinue('shape-recognition', recognitionContent.shapeItems, selected)}
              />
            )}
            {scene === 'shape-recognition-insight' && (
              <MicroInsightCard key="shape-recognition-insight" lines={[shapeInsight(signalsRef.current.shapeRatio)]} onDone={advance} />
            )}
          </>
        )}

        {uiPhase === 'profile' && report !== null && <MemoryDiscoveryReportCard key="learning-memory-profile" report={report} onContinue={finish} />}
      </AnimatePresence>
    </main>
  )
}
