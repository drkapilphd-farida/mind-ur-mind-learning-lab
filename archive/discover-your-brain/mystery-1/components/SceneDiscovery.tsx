'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MysteryLayout } from './MysteryLayout'
import { RevealCard } from './RevealCard'

const SECTIONS = [
  {
    icon: '🧠',
    title: 'What We Observed',
    body: 'Across all three scenes... your attention consistently moved toward larger visual structures before smaller details.',
  },
  {
    icon: '💡',
    title: 'Why It Matters',
    body: 'The way your brain naturally chooses what to notice first influences how you scan information, read pages and process visual information.',
  },
  {
    icon: '🚀',
    title: 'What Becomes Possible',
    body: "As you train your attention, you'll become able to notice important information faster without feeling overwhelmed.",
  },
] as const

// Real reading pauses between each section, not a quick stagger — this is
// meant to feel like anticipation, not a list rendering.
const REVEAL_PAUSE_MS = 1800
const CTA_DELAY_MS = 900

type SceneDiscoveryProps = {
  onContinue: () => void
}

// Scene 7 — Discovery. Placeholder observation text as given — the real
// pattern-analysis logic doesn't exist yet (no AI, no scoring engine).
// Sections arrive one after another, each held before the next appears.
export function SceneDiscovery({ onContinue }: SceneDiscoveryProps): React.JSX.Element {
  const [visibleCount, setVisibleCount] = useState(1)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    if (visibleCount < SECTIONS.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), REVEAL_PAUSE_MS)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setShowCta(true), CTA_DELAY_MS)
    return () => clearTimeout(timer)
  }, [visibleCount])

  return (
    <MysteryLayout>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        Here&apos;s what we noticed.
      </motion.h1>

      <div className="flex w-full max-w-md flex-col gap-4">
        {SECTIONS.slice(0, visibleCount).map((section) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <RevealCard icon={section.icon} title={section.title} body={section.body} />
          </motion.div>
        ))}
      </div>

      {showCta && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <Button size="lg" onClick={onContinue} className="min-w-[220px] rounded-full text-base shadow-sm">
            Continue
          </Button>
        </motion.div>
      )}
    </MysteryLayout>
  )
}
