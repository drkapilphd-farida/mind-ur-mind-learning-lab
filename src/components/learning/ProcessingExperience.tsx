'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { runPhase1QuickIntelligence } from '@/app/preview/learning-projects/[id]/processing/actions'
import { ProcessingTimeline } from '@/components/learning/ProcessingTimeline'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { QUICK_INTELLIGENCE_STAGES } from '@/constants/learning/processingStages'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { trackEvent } from '@/lib/analytics/track'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { ProcessingStageState } from '@/types/learning/processing'
import { ArrivalBackground } from '@/components/welcome/ArrivalBackground'
import { AIPresenceLogo } from '@/components/welcome/AIPresenceLogo'
import { HeroPromise } from '@/components/welcome/HeroPromise'
import { OnboardingJourneyIndicator } from '@/components/welcome/OnboardingJourneyIndicator'

// Sprint LW-1D — the "gradually transform into an active intelligence
// animation" beat: the Living AI Symbol starts in its calm idle breath and
// switches to 'thinking' mode shortly after mount.
const THINKING_MODE_DELAY_MS = 1500

const THINKING_SUBTITLE = "We're discovering the smartest way for you to understand, remember, and learn this material."

type Phase = 'running' | 'error'

type ProcessingExperienceProps = {
  projectId: string
  projectTitle: string
  documentId: string
  documentTitle: string
  // AI Learning Studio™ V1 Launch UX Transformation — the learner's own
  // Screen 4 selection, carried through as a plain query param on this
  // screen's own final redirect. `null` when no goal was set (e.g. a
  // direct reload of this URL) — never fabricated.
  goal?: string | null
}

// ALS-15 Instant Learning Engine™ — Phase 1 "Quick Intelligence" only.
// One real, fast, zero-AI Server Action call (`runPhase1QuickIntelligence`)
// — no multi-stage runner is needed for a single atomic call, so all four
// `QUICK_INTELLIGENCE_STAGES` show together as real, currently-in-progress
// work rather than fabricating fake sub-sequencing between them. The
// instant it succeeds, the workspace opens automatically — no manual
// "Continue" click, no separate outcome screen (Phase 3 "Background AI
// Intelligence" continues from there, tracked entirely on the
// workspace/detail page — see LearningBlueprintExperience.tsx).
export function ProcessingExperience({ projectId, projectTitle, documentId, documentTitle, goal = null }: ProcessingExperienceProps): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isThinkingMode, setIsThinkingMode] = useState(false)
  const [phase, setPhase] = useState<Phase>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const goToWorkspace = useCallback((): void => {
    const goalParam = goal ? `?goal=${goal}` : ''
    if (prefersReducedMotion) {
      router.push(`/preview/learning-projects/${projectId}${goalParam}`)
      return
    }
    setIsExiting(true)
    window.setTimeout(() => router.push(`/preview/learning-projects/${projectId}${goalParam}`), 250)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, goal, prefersReducedMotion])

  useEffect(() => {
    let cancelled = false
    trackEvent('processing_started', { projectId, documentId })

    async function run(): Promise<void> {
      const result = await runPhase1QuickIntelligence(documentId)
      if (cancelled) return

      if (!result.success) {
        setPhase('error')
        setErrorMessage(result.error)
        return
      }

      trackEvent('processing_completed', { projectId, documentId })
      goToWorkspace()
    }

    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  useEffect(() => {
    const timer = window.setTimeout(() => setIsThinkingMode(true), THINKING_MODE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  function handleCancel(): void {
    router.push('/preview/dashboard')
  }

  function handleRetry(): void {
    setPhase('running')
    setErrorMessage(null)
    setAttempt((count) => count + 1)
  }

  const stages: readonly ProcessingStageState[] = QUICK_INTELLIGENCE_STAGES.map((stage) => ({ id: stage.id, status: 'active', progress: 50 }))

  if (phase === 'error') {
    return (
      <div className="relative mx-auto max-w-lg px-6 py-16">
        <ArrivalBackground />
        <EmptyStateCard
          icon={AlertTriangle}
          title="We hit a snag preparing your Learning Project"
          description={errorMessage ?? 'Something went wrong. Please try again.'}
          action={
            <div className="flex items-center justify-center gap-3">
              <Button type="button" onClick={handleRetry}>
                Retry
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Back to Dashboard
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className={cn('relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 transition-opacity duration-[250ms]', isExiting && 'opacity-0')}>
      <ArrivalBackground />

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-7 text-center">
        <OnboardingJourneyIndicator currentStepId="thinking" className="w-full max-w-sm" />

        <AIPresenceLogo size={128} mode={isThinkingMode ? 'thinking' : 'idle'} />

        <div>
          <p className={TYPOGRAPHY.label}>{projectTitle}</p>
          <h1 className={cn(TYPOGRAPHY.display, 'mt-1')}>Preparing Your Learning Workspace</h1>
          <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-3 max-w-md text-muted-foreground')}>{THINKING_SUBTITLE}</p>
        </div>

        <HeroPromise className="mt-1 text-lg font-medium text-muted-foreground sm:text-xl md:text-2xl" startDelayMs={200} />

        <p className={cn(TYPOGRAPHY.caption, 'italic')} aria-live="polite">
          Usually takes up to 30 seconds. Large books may take a little longer.
        </p>

        <div className="w-full text-left">
          <ProcessingTimeline definitions={QUICK_INTELLIGENCE_STAGES} stages={stages} />
        </div>

        <p className={cn(TYPOGRAPHY.caption, 'sr-only')} aria-live="off">
          {documentTitle}
        </p>

        <Button type="button" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
