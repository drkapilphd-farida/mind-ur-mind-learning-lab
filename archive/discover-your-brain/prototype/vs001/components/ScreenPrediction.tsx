'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PredictionOption = 'large-shapes' | 'bright-colours' | 'human-faces' | 'not-sure'

const OPTIONS: readonly { value: PredictionOption; label: string }[] = [
  { value: 'large-shapes', label: 'Large Shapes' },
  { value: 'bright-colours', label: 'Bright Colours' },
  { value: 'human-faces', label: 'Human Faces' },
  { value: 'not-sure', label: "I'm Not Sure" },
]

type ScreenPredictionProps = {
  selected: PredictionOption | null
  onSelect: (option: PredictionOption) => void
  onContinue: () => void
}

// Single-select only — selecting a new option replaces the previous one,
// never adds to it. Stored in the parent's component state; nothing
// persisted beyond this session.
export function ScreenPrediction({ selected, onSelect, onContinue }: ScreenPredictionProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        <p className="text-sm font-medium text-muted-foreground">Before we begin...</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Which do you think your brain naturally notices first?
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
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
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
      >
        <Button
          size="lg"
          disabled={selected === null}
          onClick={onContinue}
          className="min-w-[220px] rounded-full text-base shadow-sm"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
