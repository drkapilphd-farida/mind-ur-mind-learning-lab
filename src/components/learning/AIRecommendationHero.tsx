'use client'

import Link from 'next/link'
import { LEARNING_MODES, resolveLearningModeHref } from '@/constants/learning/learningModes'
import { Button } from '@/components/ui/button'
import { recommendLearningMode } from '@/lib/blueprint/recommendLearningMode'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { LearningBlueprint } from '@/types/learning/blueprint'

type AIRecommendationHeroProps = {
  blueprint: LearningBlueprint
  projectId: string
  onClick?: () => void
}

// AI Recommendation™ (Sprint LW-1E, Section 2; simplified Sprint ALS-8) —
// the hero of the screen. Calls the real recommendLearningMode() engine
// (never hardcoded) and renders whichever of the 10 Learning Modes it
// returns, with the engine's own explanation of why. Every Learning Mode
// now resolves to a real destination, so this is always a real `<Link>`.
export function AIRecommendationHero({ blueprint, projectId, onClick }: AIRecommendationHeroProps): React.JSX.Element {
  const recommendation = recommendLearningMode(blueprint)
  const mode = LEARNING_MODES.find((item) => item.id === recommendation.modeId)
  if (!mode) throw new Error(`recommendLearningMode returned an id ("${recommendation.modeId}") with no matching Learning Mode definition`)
  const href = resolveLearningModeHref(mode, projectId)

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-background/60 px-8 py-10 text-center shadow-lg backdrop-blur-sm sm:px-12 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.06] to-transparent" aria-hidden="true" />

      <p className={cn(TYPOGRAPHY.label, 'text-primary')}>⭐ AI Recommendation</p>
      <p className="mt-4 text-5xl" aria-hidden="true">
        {mode.emoji}
      </p>
      <h2 className={cn(TYPOGRAPHY.display, 'mt-3')}>{mode.title}</h2>
      <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-4 max-w-lg text-muted-foreground')}>{recommendation.reason}</p>

      <Button asChild size="lg" className="mt-8 min-w-[260px] rounded-full">
        <Link href={href} {...(onClick !== undefined ? { onClick } : {})}>
          Start Recommended Mode <span aria-hidden="true">→</span>
        </Link>
      </Button>
    </section>
  )
}
