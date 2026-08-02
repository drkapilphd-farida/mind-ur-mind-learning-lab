'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { buildQuantumSpeedReadingReason } from '@/features/reading-discovery/buildQuantumSpeedReadingReason'
import { pickGrowthPotentialMessage } from '@/features/reading-discovery/pickGrowthPotentialMessage'

// Quantum Speed Reading™ Introduction — per your own final, authoritative
// spec: "a motivational bridge between Reading Discovery and the Quantum
// Speed Reading journey... Current Reading Speed, Current Reading Style,
// Biggest Improvement Opportunity, How Quantum Speed Reading™ can help,
// 🚀 Start Quantum Speed Reading™... a placeholder without changing the
// existing application architecture... Do not redirect to Upload. Do not
// create a Learning Project automatically." Real values arrive via URL
// query params from `ReadingSummaryCard`'s own real, already-computed
// highlights — never fabricated here. "Start Quantum Speed Reading™"
// intentionally never navigates to Upload or auto-creates a Learning
// Project; it reveals one honest, inline next-step message in place.
export function QuantumSpeedReadingIntroExperience(): React.JSX.Element {
  const searchParams = useSearchParams()
  const wpm = searchParams.get('wpm')
  const style = searchParams.get('style') ?? 'Your Reading Style'
  const opportunity = searchParams.get('opportunity') ?? 'Read Faster.'
  const whyItHelps = buildQuantumSpeedReadingReason(opportunity)
  const growthPotentialMessage = pickGrowthPotentialMessage(opportunity.length)
  const [started, setStarted] = useState(false)

  return (
    <main className="bg-background">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-16 text-center"
      >
        <LivingBrainLogo className="size-12 sm:size-14" />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className={cn(TYPOGRAPHY.h1, 'mt-2')}
        >
          🚀 Quantum Speed Reading™
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="text-lg font-semibold text-muted-foreground"
        >
          Read Fast. Learn Better.
        </motion.p>

        <div className="mt-4 flex w-full flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.32, ease: 'easeOut' }}
            className="rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
          >
            <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your Current Reading Speed</p>
            <p className="mt-1 font-heading text-3xl font-bold text-foreground">{wpm !== null ? `${wpm} WPM` : 'Calculating…'}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.46, ease: 'easeOut' }}
            className="rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
          >
            <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your Current Reading Style</p>
            <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{style}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
            className="rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
          >
            <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your Biggest Improvement Opportunity</p>
            <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{opportunity}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.74, ease: 'easeOut' }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-left shadow-md"
          >
            <p className={cn(TYPOGRAPHY.label, 'text-primary')}>How Quantum Speed Reading™ Can Help</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{whyItHelps}</p>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.82, ease: 'easeOut' }}
          className="text-sm font-semibold text-primary"
        >
          {growthPotentialMessage}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.9, ease: 'easeOut' }} className="mt-4 w-full">
          {started ? (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-sm text-muted-foreground">
              Quantum Speed Reading™ opens once you upload your first document. We&rsquo;ll bring you here the moment it&rsquo;s ready.
            </motion.p>
          ) : (
            <Button size="lg" className="min-h-14 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/20" onClick={() => setStarted(true)}>
              🚀 Start Quantum Speed Reading™
            </Button>
          )}
        </motion.div>
      </motion.div>
    </main>
  )
}
