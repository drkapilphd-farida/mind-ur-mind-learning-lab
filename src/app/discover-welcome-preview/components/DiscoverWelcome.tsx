'use client'

import { motion } from 'framer-motion'
import { Zap, Brain, Target, ArrowRight } from 'lucide-react'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'

type DiscoverWelcomeProps = {
  onStart: () => void
}

type Feature = {
  icon: typeof Zap
  time: string
  tag: string
  label: string
}

const FEATURES: readonly Feature[] = [
  { icon: Zap, time: '30s', tag: 'Sprint', label: 'Reading Speed' },
  { icon: Brain, time: '45s', tag: 'Recall', label: 'Memory Test' },
  { icon: Target, time: '45s', tag: 'Shield', label: 'Focus Check' },
]

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
}

// Discover Your Learning Potential™ — 2-minute gamified assessment lead
// magnet. A self-contained, presentational welcome screen: all copy,
// styling, and layout live here; the only behavior it owns is calling
// `onStart` when the CTA is tapped, so the caller decides what "next
// screen" actually means (navigate, swap state, etc.). Built on the same
// real design system every other screen in this app uses — the actual
// LivingBrainLogo mark, semantic bg-background/text-foreground tokens
// (so it's correct in both light and dark themes, not hardcoded grays),
// and the same calm entrance-motion philosophy as the production
// discover-learning-potential Hero: opacity/translate only, one deliberate
// spring reserved for the CTA's hover/press.
export function DiscoverWelcome({ onStart }: DiscoverWelcomeProps): React.JSX.Element {
  return (
    <div
      className="flex min-h-screen flex-col items-center bg-background px-6 pt-10 pb-16"
      style={{ paddingBottom: 'max(4rem, env(safe-area-inset-bottom))' }}
    >
      {/* Header — brand mark + wordmark, nothing else. No nav, no
          footer links: one screen, one job, matching this feature's own
          established "no distractions before the CTA" precedent. */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center gap-2.5"
      >
        <LivingBrainLogo size={32} animated={false} />
        <span className="font-heading text-base font-semibold tracking-tight text-foreground">Mind Ur Mind</span>
      </motion.header>

      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="mt-6 font-heading text-4xl leading-[1.08] font-bold tracking-tight text-foreground sm:text-5xl"
        >
          Discover Your Learning Potential™
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
          className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          Find out how your brain naturally reads, remembers, and focuses in just 2 minutes.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1, delayChildren: 0.42 }}
          className="mt-10 grid w-full grid-cols-3 gap-3 sm:gap-4"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.label}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card/60 px-3 py-5 backdrop-blur-sm',
                'shadow-sm transition-colors duration-(--duration-base) hover:border-border hover:bg-card',
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 sm:size-10">
                <feature.icon className="size-4 text-primary sm:size-[18px]" aria-hidden="true" strokeWidth={2} />
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-semibold tracking-tight text-foreground sm:text-sm">
                  {feature.time} <span className="text-muted-foreground/60">•</span> {feature.tag}
                </span>
                <span className="text-[11px] text-muted-foreground sm:text-xs">{feature.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.85, ease: 'easeOut' }} className="mt-10 w-full max-w-xs">
          <motion.button
            type="button"
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={cn(
              'group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4',
              'text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25',
              'transition-shadow duration-(--duration-base) hover:shadow-xl hover:shadow-primary/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            Start Assessment
            <ArrowRight className="size-4 transition-transform duration-(--duration-base) group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.button>
        </motion.div>

        {/* Trust footer */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.98, ease: 'easeOut' }}
          className="mt-5 text-xs text-muted-foreground/70"
        >
          No credit card required. Instant AI Mind Profile.
        </motion.p>
      </div>
    </div>
  )
}
