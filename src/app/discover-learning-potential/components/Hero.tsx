'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const CHECKLIST_ITEMS = ['How fast you naturally read', 'How well you remember', 'How focused you stay'] as const

// Premium Mobile Polish — Welcome Screen. Same real architecture as
// before (logo → headline → subcopy → checklist → CTA); this pass tunes
// vertical rhythm to the locked 8/16/24/32/48/64 spacing scale (Logo →
// 64px → Title → 16px → Subtitle → 48px → Benefits → 48px → CTA →
// comfortable bottom safe area), and makes the CTA the clear visual
// hero. Motion stays calm — opacity/translate/scale only for the
// entrance sequence; the CTA's hover/press spring is the one
// deliberate, small exception this feature's own brief calls out by
// name, not a general bounce.
export function Hero(): React.JSX.Element {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pt-16 text-center"
      style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
        <LivingBrainLogo className="size-28 sm:size-40 lg:size-44" />
      </motion.div>

      <motion.h1
        {...fadeUp}
        transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
        className="mt-16 font-heading text-4xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
      >
        Discover Your Learning Potential™
      </motion.h1>

      <motion.p
        {...fadeUp}
        transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
        className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground sm:max-w-lg sm:text-xl sm:leading-9"
      >
        Discover how your brain naturally learns in just 5 minutes.
      </motion.p>

      <ul className="mt-12 flex flex-col items-center gap-4">
        {CHECKLIST_ITEMS.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 + index * 0.14, ease: 'easeOut' }}
            className="flex items-center gap-3 text-base text-foreground/90 sm:text-lg"
          >
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.68 + index * 0.14 + 0.1, ease: 'easeOut' }}
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10"
            >
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
            </motion.span>
            {item}
          </motion.li>
        ))}
      </ul>

      <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }} className="mt-12 text-sm font-medium text-muted-foreground sm:text-base">
        Ready to begin?
      </motion.p>

      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 1.22, ease: 'easeOut' }} className="mt-6 w-full max-w-sm">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
          <Button
            asChild
            size="lg"
            className={cn(
              'w-[90%] min-h-14 rounded-full text-base font-semibold shadow-lg shadow-primary/20 sm:w-full sm:text-lg',
              'transition-shadow duration-(--duration-base) hover:shadow-xl hover:shadow-primary/25',
            )}
          >
            <Link href="/discover-learning-potential/who-is-learning">Start My Discovery</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 1.35, ease: 'easeOut' }} className="mt-4 text-xs text-muted-foreground/70">
        No credit card. No commitment. Just 5 minutes.
      </motion.p>
    </div>
  )
}
