'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { CuriosityBridge } from '@/features/discover-learning-potential/components/CuriosityBridge'
import { DiscoveryProgressDots } from '@/features/discover-learning-potential/components/DiscoveryProgressDots'
import type { AiLearningProfile, DiscoveryStageStatus } from '@/features/discover-learning-potential/types'

type AiProfileScreenProps = {
  profile: AiLearningProfile
}

const STAGE_LABELS: Record<'reading' | 'memory' | 'focus', string> = {
  reading: 'Current Reading',
  memory: 'Current Memory',
  focus: 'Current Focus',
}

// A real, disclosed roadmap note — never a fabricated WPM/percent. Real
// scoring (reading speed, memory/focus accuracy) is the Learning
// Intelligence Engine's own future work, explicitly out of scope for
// this presentation-only polish sprint.
const SCORE_NOT_YET_AVAILABLE = 'Score unlocks once reading, memory, and focus scoring is live.'

type Screen = 'loading' | 'analysis' | 'profile'
const LOADING_DISPLAY_MS = 750
// Individual, deliberate card-by-card reveal — "never all at once."
// Wider than a typical stagger so each card visibly finishes before the
// next begins.
const CARD_REVEAL_STEP_S = 0.45

// Discover Your Learning Potential™ — AI Learning Profile. Premium
// Mobile Polish: the architecture (real per-stage completion from
// `buildAiLearningProfile`, real recommended-next-step text) is
// unchanged — only presentation, card weight, and reveal pacing are new.
// Loading → AI Analysis → one card at a time, opacity/translate/scale
// only. Every number or absence of one shown here stays real —
// `reading_discovery_sessions`/`memory_discovery_sessions`/
// `focus_discovery_sessions` are still unscored observation logs (per
// their own migrations), so this deliberately shows an honest "score
// unlocks soon" state rather than a fabricated WPM/percent/learning-
// style/estimated-potential number — see `AiLearningProfile.ts`'s own
// comment on this discipline (unchanged from the last sprint's same
// call).
export function AiProfileScreen({ profile }: AiProfileScreenProps): React.JSX.Element {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('loading')

  useEffect(() => {
    if (screen !== 'loading') return
    const timer = window.setTimeout(() => setScreen('analysis'), LOADING_DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [screen])

  if (screen === 'loading') {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
        <p className={TYPOGRAPHY.h4}>Loading your discovery data…</p>
      </main>
    )
  }

  if (screen === 'analysis') {
    return (
      <main className="bg-background">
        <CuriosityBridge moment={{ headline: 'Your AI is analyzing how you learn…', tone: 'anticipation' }} onDone={() => setScreen('profile')} />
      </main>
    )
  }

  const stages: readonly (keyof typeof STAGE_LABELS)[] = ['reading', 'memory', 'focus']

  return (
    <main
      className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center gap-8 px-6 pt-16 text-center"
      style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <DiscoveryProgressDots currentStage="ai-profile" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        Your AI Learning Profile
      </motion.h1>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {stages.map((stage, index) => (
          <StageStatusCard key={stage} label={STAGE_LABELS[stage]} status={profile[stage]} revealIndex={index} />
        ))}
      </div>

      <RecommendationCard text={profile.recommendedNextStep} isComplete={profile.hasEnoughDataForFullProfile} revealIndex={stages.length} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + (stages.length + 1) * CARD_REVEAL_STEP_S, ease: 'easeOut' }} className="w-full max-w-sm">
        <Button
          size="lg"
          className="min-h-14 w-[90%] rounded-full text-base font-semibold shadow-lg shadow-primary/20 sm:w-full"
          onClick={() => router.push('/discover-learning-potential/learning-potential')}
        >
          Continue
        </Button>
      </motion.div>
    </main>
  )
}

function StageStatusCard({ label, status, revealIndex }: { label: string; status: DiscoveryStageStatus; revealIndex: number }): React.JSX.Element {
  const delay = 0.4 + revealIndex * CARD_REVEAL_STEP_S

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className="rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
    >
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>{label}</p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: delay + 0.22, ease: 'easeOut' }}
        className={cn(status.completed ? cn(TYPOGRAPHY.h3, 'text-success') : cn(TYPOGRAPHY.small, 'text-muted-foreground'), 'mt-1.5')}
      >
        {status.completed ? 'Completed' : SCORE_NOT_YET_AVAILABLE}
      </motion.p>
    </motion.div>
  )
}

function RecommendationCard({ text, isComplete, revealIndex }: { text: string; isComplete: boolean; revealIndex: number }): React.JSX.Element {
  const delay = 0.4 + revealIndex * CARD_REVEAL_STEP_S

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className="w-full rounded-2xl border border-primary/15 bg-primary/5 p-6 text-left shadow-md"
    >
      <div className="flex items-center gap-2">
        {isComplete && <Sparkles className="size-4 text-primary" aria-hidden="true" />}
        <p className={cn(TYPOGRAPHY.label, 'text-primary')}>Recommended Journey</p>
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: delay + 0.22, ease: 'easeOut' }} className={cn(TYPOGRAPHY.body, 'mt-2')}>
        {text}
      </motion.p>
    </motion.div>
  )
}
