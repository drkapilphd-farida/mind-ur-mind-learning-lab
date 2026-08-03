'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ArrivalBackground } from './ArrivalBackground'
import { AIPresenceLogo } from './AIPresenceLogo'
import { HeroPromise } from './HeroPromise'
import { OnboardingJourneyIndicator } from './OnboardingJourneyIndicator'

type ArrivalExperienceProps = {
  firstName: string | null
  isReturningUser: boolean
}

// Sprint LW-1A — Arrival Experience™'s time-of-day greeting depends on the
// visitor's local clock, which the server can't know — computed client-side
// after mount, with a neutral SSR-safe fallback, same established pattern
// as src/components/dashboard/GreetingHeading.tsx. Kept local rather than
// extracting/reusing that component's internal helper — see
// docs/PRODUCTION_HANDOFF_LW_1A.md's Known Limitations for why.
function getTimeOfDayGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Staggered, calm entrance — never flashy. Each stage reveals ~180ms after
// the previous, all gated by usePrefersReducedMotion on top of globals.css's
// blanket reduced-motion safety net.
const STAGE_DELAY_MS = 180

// AI Presence™ (UX Micro Sprint) — pressing "Let's Begin" no longer
// navigates instantly: a brief acknowledgment glow on the logo (~300ms,
// see AIPresenceLogo's `acknowledging` prop) plus a short local fade of
// this screen's own content, then navigation — "acknowledge the action...
// then gracefully fade into the next screen transition." Skipped entirely
// under reduced motion (immediate navigation, no delay), consistent with
// "replace the breathing animation with a completely static logo."
const ACKNOWLEDGE_MS = 300
// Kept in sync by hand with the `duration-[250ms]` Tailwind arbitrary-value
// class below — Tailwind's static analysis can't read a JS constant, so
// the class string itself must stay a literal.
const EXIT_FADE_MS = 250

export function ArrivalExperience({ firstName, isReturningUser }: ArrivalExperienceProps): React.JSX.Element {
  const [timeOfDayGreeting, setTimeOfDayGreeting] = useState<string | null>(null)
  const [isAcknowledging, setIsAcknowledging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const router = useRouter()

  useEffect(() => {
    setTimeOfDayGreeting(getTimeOfDayGreeting(new Date().getHours()))
  }, [])

  const handleBegin = (): void => {
    if (prefersReducedMotion) {
      router.push('/welcome/learning-goal')
      return
    }
    setIsAcknowledging(true)
    setIsExiting(true)
    window.setTimeout(() => router.push('/welcome/learning-goal'), ACKNOWLEDGE_MS + EXIT_FADE_MS)
  }

  const stageClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both' : ''
  const stageStyle = (stageIndex: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${stageIndex * STAGE_DELAY_MS}ms` } : undefined

  const nameSuffix = firstName !== null && firstName.length > 0 ? `, ${firstName}` : ''

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <ArrivalBackground />

      <div
        className={cn(
          'mx-auto flex w-full max-w-lg flex-col items-center gap-8 text-center transition-opacity duration-[250ms]',
          isExiting && 'opacity-0',
        )}
      >
        <div className={cn(stageClass, 'w-full max-w-sm')} style={stageStyle(0)}>
          <OnboardingJourneyIndicator currentStepId="welcome" className="mb-6" />
          <AIPresenceLogo size={112} acknowledging={isAcknowledging} className="mb-4" />
          <p className={TYPOGRAPHY.label}>Quantum Mind™</p>
        </div>

        <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground', stageClass)} style={stageStyle(1)}>
          {timeOfDayGreeting ?? 'Hello'}.
        </p>

        <div className={stageClass} style={stageStyle(2)}>
          <h1 className={TYPOGRAPHY.display}>{isReturningUser ? `Welcome back${nameSuffix}.` : 'Welcome to Quantum Mind.'}</h1>
        </div>

        <div className={stageClass} style={stageStyle(3)}>
          <HeroPromise />
        </div>

        <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto max-w-md text-muted-foreground', stageClass)} style={stageStyle(4)}>
          Bring anything you want to learn.
          <br />
          We&rsquo;ll transform it into your personal learning journey.
        </p>

        <div className={stageClass} style={stageStyle(5)}>
          <Button size="lg" className="rounded-full px-8" onClick={handleBegin}>
            Let&rsquo;s Begin <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
