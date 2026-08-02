'use client'

import { motion } from 'framer-motion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { DiscoveryProgressDots } from '@/features/discover-learning-potential/components/DiscoveryProgressDots'
import { FocusExperimentLayout } from './FocusExperimentLayout'

type WelcomeCardProps = {
  onBegin: () => void
}

// Welcome — sets the tone: this is observation, not a test. Mirrors
// Memory Discovery's own `WelcomeCard` shape exactly (outer-journey
// progress dots, "Today's Mission" framing, one real CTA).
export function WelcomeCard({ onBegin }: WelcomeCardProps): React.JSX.Element {
  return (
    <FocusExperimentLayout ctaLabel="Begin" onCta={onBegin}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="mb-6 flex justify-center">
        <DiscoveryProgressDots currentStage="focus" />
      </motion.div>
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Today&rsquo;s Mission</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Focus Discovery™</h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        Let&apos;s discover how your brain naturally manages attention.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground">
        <span aria-hidden="true">⏱</span>
        Approximately 4 Minutes
      </div>
    </FocusExperimentLayout>
  )
}
