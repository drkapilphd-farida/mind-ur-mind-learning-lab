'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { PersistenceChallengeImage } from '../../persistence-challenge/persistenceChallengeImages'
import type { ReflectionResponse } from '../../persistence-challenge/persistenceChallengeTypes'
import { completePersistenceChallengeSession } from '../../persistence-challenge/actions/completePersistenceChallengeSession'
import { WelcomeScreen } from './WelcomeScreen'
import { PreparationScreen } from './PreparationScreen'
import { ObservationScreen } from './ObservationScreen'
import { BlackScreen } from './BlackScreen'
import { ReflectionScreen } from './ReflectionScreen'
import { JournalScreen } from './JournalScreen'
import { AiCoachScreen } from './AiCoachScreen'
import { CompletionScreen } from './CompletionScreen'

type PersistenceChallengePhase =
  | 'welcome'
  | 'preparation'
  | 'observation'
  | 'black-screen'
  | 'reflection'
  | 'journal'
  | 'ai-coach'
  | 'complete'

type PersistenceChallengeExperienceProps = {
  image: PersistenceChallengeImage
}

const BLACK_SCREEN_SECONDS = 30

// Sprint-6 — the Image Persistence Challenge™ 9-step guided protocol.
// Same phase-machine/hasSavedRef-guard shape as ImagePersistenceExperience.tsx
// (Sprint-3B) and completeFixationSession.ts's orchestrators (Sprint-5),
// applied to a wholly new, isolated flow — no file from either prior
// sprint is imported or modified.
export function PersistenceChallengeExperience({ image }: PersistenceChallengeExperienceProps): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<PersistenceChallengePhase>('welcome')
  const [reflectionResponse, setReflectionResponse] = useState<ReflectionResponse | null>(null)
  const [journalNotes, setJournalNotes] = useState<string | null>(null)
  const [completedSessionCount, setCompletedSessionCount] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [persistenceScore, setPersistenceScore] = useState(0)
  const [visualIntelligenceScore, setVisualIntelligenceScore] = useState(0)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const handleBegin = useCallback(() => setPhase('preparation'), [])
  const handleReady = useCallback(() => setPhase('observation'), [])
  const handleObservationComplete = useCallback(() => setPhase('black-screen'), [])
  const handleBlackScreenComplete = useCallback(() => setPhase('reflection'), [])
  const handleReflectionSelect = useCallback((response: ReflectionResponse) => {
    setReflectionResponse(response)
    setPhase('journal')
  }, [])
  const handleJournalContinue = useCallback((notes: string | null) => {
    setJournalNotes(notes)
    setPhase('ai-coach')
  }, [])
  const handleAiCoachContinue = useCallback(() => setPhase('complete'), [])
  const handleContinueToNext = useCallback(() => {
    router.push('/labs/visual-intelligence/persistence-challenge')
    router.refresh()
  }, [router])

  // Fires exactly once when leaving 'journal' — saves the session, then
  // computes fresh stats + the lab-wide Visual Intelligence Score + the AI
  // Coach message, all in one round trip.
  useEffect(() => {
    if (phase !== 'ai-coach' || hasSavedRef.current || reflectionResponse === null) return
    hasSavedRef.current = true
    void completePersistenceChallengeSession({
      imageId: image.id,
      reflectionResponse,
      journalNotes,
      durationSeconds: image.duration + BLACK_SCREEN_SECONDS,
    }).then((result) => {
      if (result.success) {
        setCompletedSessionCount(result.stats.completedSessionCount)
        setCurrentStreak(result.stats.currentStreak)
        setPersistenceScore(result.stats.persistenceScore)
        setVisualIntelligenceScore(result.visualIntelligenceScore)
        setCoachMessage(result.coachMessage)
      }
    })
  }, [phase, image.id, image.duration, reflectionResponse, journalNotes])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''
  // Observation and BlackScreen are already full-screen fixed overlays —
  // no fade wrapper padding needed for those phases.
  const isFullScreenPhase = phase === 'observation' || phase === 'black-screen'

  return (
    <div key={phase} className={cn(!isFullScreenPhase && fadeClass)}>
      {phase === 'welcome' && <WelcomeScreen onBegin={handleBegin} />}
      {phase === 'preparation' && <PreparationScreen onReady={handleReady} />}
      {phase === 'observation' && <ObservationScreen image={image} onComplete={handleObservationComplete} />}
      {phase === 'black-screen' && <BlackScreen onComplete={handleBlackScreenComplete} />}
      {phase === 'reflection' && <ReflectionScreen onSelect={handleReflectionSelect} />}
      {phase === 'journal' && <JournalScreen onContinue={handleJournalContinue} />}
      {phase === 'ai-coach' && <AiCoachScreen message={coachMessage} onContinue={handleAiCoachContinue} />}
      {phase === 'complete' && (
        <CompletionScreen
          completedSessionCount={completedSessionCount}
          currentStreak={currentStreak}
          persistenceScore={persistenceScore}
          visualIntelligenceScore={visualIntelligenceScore}
          onContinue={handleContinueToNext}
        />
      )}
    </div>
  )
}
