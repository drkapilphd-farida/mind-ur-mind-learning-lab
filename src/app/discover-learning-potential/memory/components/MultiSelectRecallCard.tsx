'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RECALL_IDLE_ADVANCE_MS } from '@/features/memory-discovery/memoryTimingConfig'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

type MultiSelectRecallCardProps = {
  prompt: string
  choices: readonly string[]
  onContinue: (selected: string[]) => void
}

// Shared recall screen for Visual Memory™, Word Memory™, and Word Chunk
// Recall™ — the items have disappeared; the user picks whichever ones
// they remember from a mixed grid. Any number (including zero) may be
// selected — there's nothing to get "right". No Continue button: this
// auto-advances once selections go idle, covering both "picked some, then
// stopped" and "never tapped at all" the same way. Sprint-2.1 FIX-12 —
// the real idle-advance window (a real user decision window, not a
// system pause) lives in the one centralized timing config.
export function MultiSelectRecallCard({ prompt, choices, onContinue }: MultiSelectRecallCardProps): React.JSX.Element {
  const [selected, setSelected] = useState<string[]>([])
  const selectedRef = useRef<string[]>(selected)
  selectedRef.current = selected

  useEffect(() => {
    const timeout = window.setTimeout(() => onContinue(selectedRef.current), RECALL_IDLE_ADVANCE_MS)
    return () => window.clearTimeout(timeout)
  }, [selected, onContinue])

  function toggle(item: string): void {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  return (
    <MemoryExperimentLayout maxWidthClassName="max-w-lg">
      <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">{prompt}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {choices.map((item) => {
          const isSelected = selected.includes(item)
          return (
            <motion.button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              aria-pressed={isSelected}
              whileTap={{ scale: 0.94 }}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200',
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card/60 text-foreground hover:bg-muted',
              )}
            >
              {item}
            </motion.button>
          )
        })}
      </div>
    </MemoryExperimentLayout>
  )
}
