'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MysteryLayout } from './MysteryLayout'

export type SurpriseAnswer = 'yes' | 'probably' | 'not-really'

const OPTIONS: readonly { value: SurpriseAnswer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'probably', label: 'Probably' },
  { value: 'not-really', label: 'Not Really' },
]

const REVEAL_HOLD_MS = 2800

type SceneSurpriseProps = {
  onContinue: () => void
}

// Scene 8 — Surprise. Selecting any answer reveals the same honest
// closing line and then auto-advances — the point isn't which answer was
// picked, it's the realization that follows.
export function SceneSurprise({ onContinue }: SceneSurpriseProps): React.JSX.Element {
  const [answer, setAnswer] = useState<SurpriseAnswer | null>(null)

  useEffect(() => {
    if (answer === null) return undefined
    const timer = setTimeout(onContinue, REVEAL_HOLD_MS)
    return () => clearTimeout(timer)
  }, [answer, onContinue])

  return (
    <MysteryLayout>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        Did you notice everything?
      </motion.h1>

      {answer === null ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          role="group"
          aria-label="Answer options"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAnswer(option.value)}
              className={cn(
                'min-h-[48px] rounded-full border px-6 text-sm font-medium transition-all duration-(--duration-fast)',
                'hover:border-foreground/20 hover:bg-muted active:scale-[0.98]',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
                'border-border bg-card text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </motion.div>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md text-lg leading-8 text-muted-foreground"
        >
          Almost nobody does.
          <br />
          Your brain is designed to filter information.
          <br />
          That&apos;s exactly what makes it powerful.
        </motion.p>
      )}
    </MysteryLayout>
  )
}
