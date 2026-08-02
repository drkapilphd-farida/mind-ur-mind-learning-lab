'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MysteryLayout } from './MysteryLayout'

export type Prediction = 'human-faces' | 'bright-colours' | 'large-shapes' | 'not-sure'

const OPTIONS: readonly { value: Prediction; label: string }[] = [
  { value: 'human-faces', label: 'Human Faces' },
  { value: 'bright-colours', label: 'Bright Colours' },
  { value: 'large-shapes', label: 'Large Shapes' },
  { value: 'not-sure', label: "I'm Not Sure" },
]

type ScenePredictionProps = {
  selected: Prediction | null
  onSelect: (option: Prediction) => void
  onContinue: () => void
}

// Scene 2 — Prediction. The answer is stored in local state and never
// shown back to the user at any point in this chapter — it exists purely
// as a private baseline for the founder to compare against later.
export function ScenePrediction({ selected, onSelect, onContinue }: ScenePredictionProps): React.JSX.Element {
  return (
    <MysteryLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        <p className="text-sm font-medium text-muted-foreground">Before we begin...</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          What do you <em className="not-italic font-semibold">think</em> your brain notices first?
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        role="group"
        aria-label="Prediction options"
        className="grid w-full max-w-sm grid-cols-1 gap-3"
      >
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={selected === option.value}
            className={cn(
              'flex min-h-[52px] items-center justify-center rounded-2xl border px-6 py-3 text-sm font-medium transition-all duration-(--duration-fast)',
              'hover:border-foreground/20 hover:bg-muted active:scale-[0.98]',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
              selected === option.value
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      >
        <Button
          size="lg"
          disabled={selected === null}
          onClick={onContinue}
          className="min-w-[220px] rounded-full text-base shadow-sm"
        >
          Let&apos;s Find Out
        </Button>
      </motion.div>
    </MysteryLayout>
  )
}
