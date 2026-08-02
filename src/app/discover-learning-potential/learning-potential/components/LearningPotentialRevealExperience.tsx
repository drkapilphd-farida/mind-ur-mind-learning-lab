'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { getFocusProfile } from '@/features/focus-discovery/focusProfileHandoff'
import { getLastReadingSpeed } from '@/features/discover-learning-potential/readingSpeedHandoff'
import { deriveLearningIdentity, derivePersonalOutcomeMessage } from '@/features/learning-potential-reveal/learningPotentialCopy'
import { LEARNING_POTENTIAL_SCENES } from '@/features/learning-potential-reveal/types'
import { CelebrationScreen } from './CelebrationScreen'
import { IdentityRevealScreen } from './IdentityRevealScreen'
import { HiddenPotentialScreen } from './HiddenPotentialScreen'
import { EmotionalPauseScreen } from './EmotionalPauseScreen'
import { TransformationPreviewScreen } from './TransformationPreviewScreen'
import { PersonalizedRoadmapScreen } from './PersonalizedRoadmapScreen'
import { WhyContinueScreen } from './WhyContinueScreen'
import { FinalBridgeScreen } from './FinalBridgeScreen'
import { PremiumCtaScreen } from './PremiumCtaScreen'

// Learning Potential Reveal™ (UDCE-1, refined by UDCE-1.5 Momentum to
// Transformation™) — Unified Discovery Completion Experience™. "NOT a
// result screen. NOT a subscription page. The emotional bridge between
// Brain Discovery™ and AI Learning Studio™." Nine screens, one idea
// each, sequential, manual pacing (except the wordless Emotional
// Pause™, which auto-advances) — mirrors this whole project's Mission
// Journey™ convention where the user otherwise always controls when to
// move forward. Real personalization comes from whatever real
// cross-feature data already exists (`focusProfileHandoff`,
// `readingSpeedHandoff`, the real "Myself/My Child" selection) — an
// honest generic fallback when neither is present, never a fabricated
// claim.
export function LearningPotentialRevealExperience(): React.JSX.Element {
  const router = useRouter()
  const [sceneIndex, setSceneIndex] = useState(0)
  const scene = LEARNING_POTENTIAL_SCENES[sceneIndex]!

  const focusProfile = useMemo(() => getFocusProfile(), [])
  const readingSpeed = useMemo(() => getLastReadingSpeed(), [])
  const identity = useMemo(() => deriveLearningIdentity(focusProfile), [focusProfile])
  const outcomeMessage = useMemo(
    () => derivePersonalOutcomeMessage(readingSpeed !== null, focusProfile),
    [readingSpeed, focusProfile],
  )

  const advance = (): void => setSceneIndex((index) => Math.min(index + 1, LEARNING_POTENTIAL_SCENES.length - 1))

  // Premium CTA™ hands off to the Discovery → Upload Bridge™ (ALS-14) —
  // the real emotional bridge into applying the just-built Learning
  // Profile, rather than jumping straight to the Studio hub.
  const finish = (): void => router.push('/discover-learning-potential/upload-bridge')

  return (
    <main className="bg-background">
      <AnimatePresence mode="wait">
        {scene === 'celebration' && <CelebrationScreen key="celebration" onContinue={advance} />}
        {scene === 'identity-reveal' && <IdentityRevealScreen key="identity-reveal" identity={identity} onContinue={advance} />}
        {scene === 'hidden-potential' && <HiddenPotentialScreen key="hidden-potential" outcomeMessage={outcomeMessage} onContinue={advance} />}
        {scene === 'emotional-pause' && <EmotionalPauseScreen key="emotional-pause" onDone={advance} />}
        {scene === 'transformation-preview' && <TransformationPreviewScreen key="transformation-preview" onContinue={advance} />}
        {scene === 'personalized-roadmap' && <PersonalizedRoadmapScreen key="personalized-roadmap" onContinue={advance} />}
        {scene === 'why-continue' && <WhyContinueScreen key="why-continue" onContinue={advance} />}
        {scene === 'final-bridge' && <FinalBridgeScreen key="final-bridge" onContinue={advance} />}
        {scene === 'premium-cta' && <PremiumCtaScreen key="premium-cta" onContinue={finish} />}
      </AnimatePresence>
    </main>
  )
}
