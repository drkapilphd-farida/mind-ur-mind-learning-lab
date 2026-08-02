'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MysteryLayout } from './MysteryLayout'

const LINE_INTERVAL_MS = 1000

const LINES = [
  'Your eyes receive thousands of pieces of information every second.',
  'But your brain notices only a few.',
  "Let's discover what YOUR brain naturally notices first.",
] as const

type SceneHookProps = {
  onContinue: () => void
}

// Scene 1 — Hook. Lines accumulate one at a time (not replacing each
// other) with a 1s pause between, then the CTA appears once all three
// have landed.
export function SceneHook({ onContinue }: SceneHookProps): React.JSX.Element {
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    if (visibleCount >= LINES.length) return undefined
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), LINE_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [visibleCount])

  const allLinesShown = visibleCount >= LINES.length

  return (
    <MysteryLayout>
      <div className="max-w-xl space-y-4">
        {LINES.slice(0, visibleCount).map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={
              index === 0
                ? 'font-heading text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl'
                : 'text-lg leading-8 text-muted-foreground'
            }
          >
            {line}
          </motion.p>
        ))}
      </div>

      {allLinesShown && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <Button size="lg" onClick={onContinue} className="min-w-[220px] rounded-full text-base shadow-sm">
            Begin Discovery
          </Button>
        </motion.div>
      )}
    </MysteryLayout>
  )
}
