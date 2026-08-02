'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useFocusDiscoverySession } from '@/features/focus-discovery/useFocusDiscoverySession'
import { FOCUS_DISCOVERY_SCENES } from '@/features/focus-discovery/types'
import { FOCUS_MISSION_ORDER, SCENE_TO_MISSION } from '@/features/focus-discovery/focusMissions'
import { pickFocusEncouragement } from '@/features/focus-discovery/pickFocusEncouragement'
import { AiVoiceMemory } from '@/features/focus-discovery/aiVoiceMemory'
import { computeFocusIntelligenceReport, computeMissionRatio, type FocusIntelligenceInputs } from '@/features/focus-discovery/focusIntelligenceEngine'
import { recordFocusProfile } from '@/features/focus-discovery/focusProfileHandoff'
import type { FocusDiscoveryEvent } from '@/features/focus-discovery/types'
import { WelcomeCard } from './WelcomeCard'
import { MissionIntroCard } from './MissionIntroCard'
import { MissionCompleteCard } from './MissionCompleteCard'
import { MissionCuriosityLoop } from './MissionCuriosityLoop'
import { FocusDiscoveryReportCard } from './FocusDiscoveryReportCard'
import { AttentionLockCard } from './AttentionLockCard'
import { VisualSearchCard } from './VisualSearchCard'
import { ReactionFocusCard } from './ReactionFocusCard'
import { SustainedFocusCard } from './SustainedFocusCard'
import { CognitiveFlexibilityCard } from './CognitiveFlexibilityCard'

type UiPhase = 'welcome' | 'mission-intro' | 'in-mission' | 'mission-complete' | 'curiosity-loop' | 'complete'

// A real, distinct seed per mission — far enough apart that no two
// missions' own internal seed offsets could ever collide.
const MISSION_SEED_STRIDE = 100000

// Focus Discovery Foundation™ (Sprint-1) — the real Mission Journey™:
// Welcome → (Mission Intro → Mission → Mission Complete → Curiosity
// Loop) × 5 → Focus Discovery Complete. Mirrors Reading/Memory
// Discovery's own identical outer phase machine exactly. Unlike Memory
// Discovery, every mission here is one self-contained, continuous,
// interactive scene (no separate flash/recall split) — `sceneIndex`
// still walks the real `FOCUS_DISCOVERY_SCENES` array, but each step IS
// a whole mission.
//
// FIX-14 — "Do not calculate the final Focus Profile yet." Every
// mission's own real result event is recorded as raw, structured
// behavioural data (`useFocusDiscoverySession`) and nothing here derives
// a score or profile from it — that's Sprint-2's Focus Intelligence
// Engine™.
export function FocusDiscoveryExperience(): React.JSX.Element {
  const router = useRouter()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [uiPhase, setUiPhase] = useState<UiPhase>('welcome')
  const { enterScene, recordSceneExit, recordMissionResult, submitSession } = useFocusDiscoverySession()

  const sessionSeed = useMemo(() => Date.now(), [])
  // Sprint-1.5 FIX-11 Adaptive Encouragement™ — the most recent real
  // mission result, read by Mission Complete to compute its own real,
  // reactive line (`pickFocusEncouragement`) — `null` before any
  // mission has finished.
  const lastResultRef = useRef<Exclude<FocusDiscoveryEvent, { type: 'scene_timing' }> | null>(null)
  // Sprint-1.7 PART-2 — every real mission's own real result, collected
  // as it finishes, so the Focus Intelligence Engine™ can compute one
  // real report the instant the whole real journey ends.
  const resultsRef = useRef<Partial<FocusIntelligenceInputs>>({})
  // Sprint-1.9 AI Presence Engine™ — the one real, session-wide
  // behavioural memory (never repeats a line, tracks the real
  // mission-to-mission performance trend) — created once, held for the
  // whole real journey.
  const aiVoiceMemoryRef = useRef(new AiVoiceMemory())

  const scene = FOCUS_DISCOVERY_SCENES[sceneIndex]!

  // Real dwell-time tracking only ever starts once a real tracked scene
  // is actually on screen — never while a Mission Intro/Complete/
  // Curiosity beat sits in front of it (mirrors Reading/Memory
  // Discovery's own identical `phase`-gated `enterScene` call).
  useEffect(() => {
    if (uiPhase === 'welcome' || uiPhase === 'in-mission' || uiPhase === 'complete') {
      enterScene(scene)
    }
  }, [uiPhase, scene, enterScene])

  const handleWelcomeBegin = useCallback((): void => {
    recordSceneExit('welcome')
    setSceneIndex(1)
    setUiPhase('mission-intro')
  }, [recordSceneExit])

  const advance = useCallback((): void => {
    recordSceneExit(scene)
    const nextIndex = Math.min(sceneIndex + 1, FOCUS_DISCOVERY_SCENES.length - 1)
    const nextScene = FOCUS_DISCOVERY_SCENES[nextIndex]!
    setSceneIndex(nextIndex)
    // FIX-01 — "Every mission should feel like the next chapter of one
    // continuous journey." Crossing out of a Mission's own scene always
    // surfaces a real Mission Complete beat first — never a silent jump.
    if (SCENE_TO_MISSION[scene] !== SCENE_TO_MISSION[nextScene]) {
      setUiPhase('mission-complete')
    }
  }, [scene, sceneIndex, recordSceneExit])

  const handleMissionReady = useCallback((): void => setUiPhase('in-mission'), [])

  const handleMissionCompleteContinue = useCallback((): void => {
    if (scene === 'focus-discovery-complete') {
      setUiPhase('complete')
      return
    }
    setUiPhase('curiosity-loop')
  }, [scene])

  const handleCuriosityDone = useCallback((): void => setUiPhase('mission-intro'), [])

  const handleMissionResult = useCallback(
    (event: Exclude<FocusDiscoveryEvent, { type: 'scene_timing' }>): void => {
      recordMissionResult(event)
      lastResultRef.current = event
      aiVoiceMemoryRef.current.recordMissionRatio(computeMissionRatio(event))
      if (event.type === 'attention_lock_result') resultsRef.current.attentionLock = event
      else if (event.type === 'visual_search_result') resultsRef.current.visualSearch = event
      else if (event.type === 'reaction_focus_result') resultsRef.current.reactionFocus = event
      else if (event.type === 'sustained_focus_result') resultsRef.current.sustainedFocus = event
      else resultsRef.current.cognitiveFlexibility = event
      advance()
    },
    [recordMissionResult, advance],
  )

  // Computed once, the instant the closing scene is reached — every real
  // mission has already finished by then (the real scene order guarantees
  // it), so all five real results are always present here.
  const report = useMemo(() => {
    if (scene !== 'focus-discovery-complete') return null
    const r = resultsRef.current
    if (r.attentionLock === undefined || r.visualSearch === undefined || r.reactionFocus === undefined || r.sustainedFocus === undefined || r.cognitiveFlexibility === undefined) {
      return null
    }
    return computeFocusIntelligenceReport({
      attentionLock: r.attentionLock,
      visualSearch: r.visualSearch,
      reactionFocus: r.reactionFocus,
      sustainedFocus: r.sustainedFocus,
      cognitiveFlexibility: r.cognitiveFlexibility,
    })
  }, [scene])

  // Sprint-2.0 PREPARATION FOR AI LEARNING STUDIO™ — "pass behavioural
  // profile internally... the next experience should already feel
  // personalized." Written once, the instant the real report exists —
  // a real side effect, deliberately kept out of the `report` memo
  // above (which stays a pure computation).
  useEffect(() => {
    if (report !== null) recordFocusProfile(report)
  }, [report])

  const finish = useCallback((): void => {
    recordSceneExit(scene)
    submitSession(true)
    // Discover Your Learning Potential™ — continues the real locked flow
    // (Reading → Memory → Focus → AI Profile).
    router.push('/discover-learning-potential/ai-profile')
  }, [scene, recordSceneExit, submitSession, router])

  // The Mission a Mission Complete/Curiosity Loop beat refers to: while
  // `uiPhase` is 'mission-complete', `scene`/`sceneIndex` have already
  // advanced past the Mission that just finished — its real last scene
  // sits one position back.
  const justCompletedMission = SCENE_TO_MISSION[FOCUS_DISCOVERY_SCENES[Math.max(0, sceneIndex - 1)]!]
  const currentMission = SCENE_TO_MISSION[scene]
  const missionSeed = currentMission !== undefined ? sessionSeed + FOCUS_MISSION_ORDER.indexOf(currentMission) * MISSION_SEED_STRIDE : sessionSeed

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
            aiLine={lastResultRef.current !== null ? pickFocusEncouragement(lastResultRef.current, aiVoiceMemoryRef.current) : null}
          />
        )}

        {uiPhase === 'curiosity-loop' && currentMission !== undefined && (
          <MissionCuriosityLoop key={`curiosity-${currentMission}`} nextMission={currentMission} onDone={handleCuriosityDone} />
        )}

        {uiPhase === 'in-mission' && (
          <>
            {scene === 'attention-lock' && <AttentionLockCard key="attention-lock" seed={missionSeed} onDone={handleMissionResult} />}
            {scene === 'visual-search' && <VisualSearchCard key="visual-search" seed={missionSeed} onDone={handleMissionResult} />}
            {scene === 'reaction-focus' && <ReactionFocusCard key="reaction-focus" seed={missionSeed} onDone={handleMissionResult} />}
            {scene === 'sustained-focus' && <SustainedFocusCard key="sustained-focus" seed={missionSeed} onDone={handleMissionResult} />}
            {scene === 'cognitive-flexibility' && (
              <CognitiveFlexibilityCard key="cognitive-flexibility" seed={missionSeed} onDone={handleMissionResult} />
            )}
          </>
        )}

        {uiPhase === 'complete' && report !== null && <FocusDiscoveryReportCard key="focus-discovery-complete" report={report} onContinue={finish} />}
      </AnimatePresence>
    </main>
  )
}
