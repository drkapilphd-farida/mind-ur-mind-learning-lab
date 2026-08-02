'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MysteryLayout } from './MysteryLayout'

const LINE_INTERVAL_MS = 1100

const LINES = [
  'Today you discovered what your brain notices first.',
  'But every brain also ignores things...',
  "Let's discover yours.",
] as const

// Scene 9 — Next Mystery. Same accumulating-line pattern as the Hook,
// closing on curiosity rather than a summary — the third line is the
// pull, not a wrap-up.
export function SceneNextMystery(): React.JSX.Element {
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
          <Button asChild size="lg" className="min-w-[220px] gap-2 rounded-full text-base shadow-sm">
            <Link href="/discover-your-brain/mystery-2">
              Continue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      )}
    </MysteryLayout>
  )
}
