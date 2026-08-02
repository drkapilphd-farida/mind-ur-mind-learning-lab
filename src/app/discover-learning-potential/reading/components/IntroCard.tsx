'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { DiscoveryProgressDots } from '@/features/discover-learning-potential/components/DiscoveryProgressDots'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type IntroCardProps = {
  onBegin: () => void
}

// Screen 1 — sets the tone: this is observation, not a test. Premium
// Mobile Polish adds the "Today's Mission" framing and the outer-journey
// progress dots (macro position only — see `DiscoveryProgressDots.tsx`
// for why this stays outside `ReadingExperimentLayout`'s own documented
// "no progress indicator" rule for the actual exercises).
export function IntroCard({ onBegin }: IntroCardProps): React.JSX.Element {
  return (
    <ReadingExperimentLayout ctaLabel="Begin" onCta={onBegin}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="mb-6 flex justify-center">
        <DiscoveryProgressDots currentStage="reading" />
      </motion.div>
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Today&rsquo;s Mission</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Reading Discovery™</h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        Let&apos;s discover how naturally your brain reads.
        <br />
        There are no right or wrong answers.
        <br />
        Simply read the way you normally do.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground">
        <span aria-hidden="true">⏱</span>
        Approximately 1 Minute
      </div>
    </ReadingExperimentLayout>
  )
}
