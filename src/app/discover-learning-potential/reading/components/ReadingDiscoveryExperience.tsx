'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useReadingDiscoverySession } from '@/features/reading-discovery/useReadingDiscoverySession'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { LearningIntelligenceEngine } from '@/features/discover-learning-potential/intelligence/LearningIntelligenceEngine'
import { READING_SPRINT_ORDER, type ReadingSprintId } from '@/features/reading-discovery/readingSprints'
import type { SprintRuntimeCompletion } from '@/features/reading-discovery/useContinuousSprintRuntime'
import { computeDwellConsistency, computeEffectiveReadingPerformance } from '@/features/reading-discovery/computeEffectiveReadingPerformance'
import { recordLastReadingSpeed } from '@/features/discover-learning-potential/readingSpeedHandoff'
import { IntroCard } from './IntroCard'
import { SprintMissionIntro } from './SprintMissionIntro'
import { SprintCuriosityLoop } from './SprintCuriosityLoop'
import { LiveSprintRuntimeView } from './LiveSprintRuntimeView'
import { MissionCompleteScreen } from './MissionCompleteScreen'
import { ReadingSummaryCard } from './ReadingSummaryCard'

const EXERCISE_ID = 'reading-discovery'

type Phase = 'intro' | 'mission-intro' | 'runtime' | 'mission-complete' | 'curiosity-loop' | 'summary'

// Reading Runtime Engine™ (Sprint-2 Part-2). Owns the real macro state
// this experience needs: which real Sprint is active and which real
// phase it's in (`mission-intro → runtime → curiosity-loop`, repeating
// across all 5 Sprints, then `summary`) — the same phase shape Part-1
// established, just with `scene` replaced by `runtime`: each Sprint is
// now a continuous, real, multi-item `LiveSprintRuntimeView` (see
// `useContinuousSprintRuntime.ts`) instead of a single static scene
// component. Mission Intro, Curiosity Loop, and Reading Summary are
// unchanged from Part-1 — this rewrite only replaces what happens
// *during* a Sprint, not the real hand-offs around it.
//
// The `LearningIntelligenceEngine` instance (Sprint-1 Foundation) lives
// here, for the whole run, exactly as in Part-1 — now fed continuously
// by every real item `useContinuousSprintRuntime` completes, not once
// per scene.
export function ReadingDiscoveryExperience(): React.JSX.Element {
  const router = useRouter()
  const { enterScene, recordSceneExit, submitSession } = useReadingDiscoverySession()
  const engineRef = useRef(new LearningIntelligenceEngine())
  const tier = useMemo(() => loadState(EXERCISE_ID).currentDifficultyTier, [])
  // Sprint-2.5 FIX-03 — one real Set, shared across every Sprint in this
  // session, so a later Sprint (Meaning) never re-surfaces a real
  // question/content id an earlier Sprint (Paragraph) already used.
  const usedContentIdsRef = useRef<Set<string>>(new Set())
  // Sprint-2.5 FIX-05/FIX-06/FIX-08 — real per-Sprint completion stats
  // (measured WPM, XP, combo), kept for the Mission Complete beat right
  // after each Sprint and for the final Result screen's own real
  // "You Read At" figure (the most recent real measured speed).
  const missionCompletionsRef = useRef<Partial<Record<ReadingSprintId, SprintRuntimeCompletion>>>({})

  const [phase, setPhase] = useState<Phase>('intro')
  const [sprintIndex, setSprintIndex] = useState(0)
  const currentSprint: ReadingSprintId = READING_SPRINT_ORDER[sprintIndex]!

  useEffect(() => {
    if (phase === 'intro') enterScene('intro')
    else if (phase === 'runtime') enterScene(currentSprint)
    else if (phase === 'summary') enterScene('reading-summary')
  }, [phase, currentSprint, enterScene])

  const handleIntroBegin = useCallback((): void => {
    recordSceneExit('intro')
    setPhase('mission-intro')
  }, [recordSceneExit])

  const handleMissionReady = useCallback((): void => setPhase('runtime'), [])

  const handleRuntimeComplete = useCallback(
    (completion: SprintRuntimeCompletion): void => {
      recordSceneExit(currentSprint)
      missionCompletionsRef.current[currentSprint] = completion
      // Sprint-2.5 FIX-05 — "After every mission... never jump straight
      // to the next mission." Every Sprint, including the last, passes
      // through Mission Complete before whatever comes next.
      setPhase('mission-complete')
    },
    [currentSprint, recordSceneExit],
  )

  const handleMissionCompleteContinue = useCallback((): void => {
    if (sprintIndex + 1 < READING_SPRINT_ORDER.length) {
      setPhase('curiosity-loop')
      return
    }
    setPhase('summary')
  }, [sprintIndex])

  const handleCuriosityDone = useCallback((): void => {
    setSprintIndex((index) => index + 1)
    setPhase('mission-intro')
  }, [])

  const finish = useCallback((): void => {
    recordSceneExit('reading-summary')
    submitSession(true)
    router.push('/discover-learning-potential/memory')
  }, [recordSceneExit, submitSession, router])

  const readingEstimate = engineRef.current.getAdaptiveEstimate('reading')
  const currentMissionCompletion = missionCompletionsRef.current[currentSprint]
  // Sprint-2.5 FIX-08 — "You Read At" on the final Result screen uses the
  // most recent real measured speed (Meaning Sprint has none — it
  // measures understanding, not speed).
  const latestMeasuredWpm = [...READING_SPRINT_ORDER].reverse().map((sprint) => missionCompletionsRef.current[sprint]?.finalWpm).find((wpm): wpm is number => wpm !== null && wpm !== undefined) ?? null
  const snapshot = engineRef.current.getSnapshot()
  const hesitationCount = snapshot.filter((signal) => signal.kind === 'hesitation').length
  // Sprint-2.6B FIX-16 — "Effective Reading Speed," never raw WPM alone.
  // Real comprehension accuracy blended across every real Sprint that
  // actually asked questions (Paragraph + Reading Understanding), real
  // hesitation rate, and real dwell-rhythm consistency all modulate the
  // final number the Result screen shows.
  const questionAccuracies = Object.values(missionCompletionsRef.current)
    .map((completion) => completion?.questionAccuracy)
    .filter((accuracy): accuracy is number => accuracy !== null && accuracy !== undefined)
  const comprehensionAccuracy = questionAccuracies.length > 0 ? questionAccuracies.reduce((sum, value) => sum + value, 0) / questionAccuracies.length : null
  const dwellConsistency = computeDwellConsistency(snapshot.filter((signal) => signal.kind === 'recognition-speed').map((signal) => signal.value))
  const effectiveReadingSpeed = computeEffectiveReadingPerformance({
    rawWpm: latestMeasuredWpm,
    comprehensionAccuracy,
    hesitationRate: snapshot.length > 0 ? hesitationCount / snapshot.length : 0,
    dwellConsistency,
  })

  // Memory Discovery™ Sprint-2.1 FIX-03 — hands this session's own real
  // Effective Reading Speed to the one small, additive cross-experience
  // bridge (`readingSpeedHandoff.ts`) the moment it's real and final, so
  // Memory Discovery's own Adaptive Timing Engine™ can read it back
  // later. Never exposed to the user here — this is silent handoff only.
  useEffect(() => {
    if (phase === 'summary' && effectiveReadingSpeed !== null) {
      recordLastReadingSpeed(effectiveReadingSpeed)
    }
  }, [phase, effectiveReadingSpeed])

  return (
    <main className="bg-background">
      <AnimatePresence mode="wait">
        {phase === 'intro' && <IntroCard key="intro" onBegin={handleIntroBegin} />}

        {phase === 'mission-intro' && <SprintMissionIntro key={`mission-${currentSprint}`} sprint={currentSprint} onReady={handleMissionReady} />}

        {phase === 'runtime' && (
          <LiveSprintRuntimeView
            key={`runtime-${currentSprint}`}
            sprint={currentSprint}
            tier={tier}
            engine={engineRef.current}
            sharedUsedContentIds={usedContentIdsRef.current}
            onComplete={handleRuntimeComplete}
          />
        )}

        {phase === 'mission-complete' && currentMissionCompletion !== undefined && (
          <MissionCompleteScreen
            key={`mission-complete-${currentSprint}`}
            sprint={currentSprint}
            completion={currentMissionCompletion}
            onContinue={handleMissionCompleteContinue}
          />
        )}

        {phase === 'curiosity-loop' && <SprintCuriosityLoop key={`curiosity-${sprintIndex}`} nextSprint={READING_SPRINT_ORDER[sprintIndex + 1]!} onDone={handleCuriosityDone} />}

        {phase === 'summary' && (
          <ReadingSummaryCard
            key="summary"
            onContinue={finish}
            measuredWpm={effectiveReadingSpeed}
            signalCount={snapshot.length}
            hesitationCount={hesitationCount}
            trend={readingEstimate.trend}
            comprehensionAccuracy={comprehensionAccuracy}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
