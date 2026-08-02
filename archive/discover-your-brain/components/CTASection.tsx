'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

// Primary CTA ("Begin My Journey") + a subtle secondary disclosure ("How
// It Works") that never competes with it. The disclosure is a genuine,
// self-contained explanation rather than a dead link, since Screen 2
// doesn't exist yet.
export function CTASection(): React.JSX.Element {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
        <Button asChild size="lg" className="min-w-[240px] rounded-full text-base shadow-sm">
          <Link href="/discover-your-brain/mystery-1">Begin My Journey</Link>
        </Button>
      </motion.div>

      <button
        type="button"
        onClick={() => setHowItWorksOpen((open) => !open)}
        aria-expanded={howItWorksOpen}
        className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-(--duration-fast) hover:text-foreground hover:underline"
      >
        How It Works
      </button>

      <AnimatePresence>
        {howItWorksOpen && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-md overflow-hidden text-sm leading-6 text-muted-foreground"
          >
            You&apos;ll explore how you read, remember and focus through a few short, interactive moments — then
            receive your personalized Brain Profile and Transformation Journey™.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
