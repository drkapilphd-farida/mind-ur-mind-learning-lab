'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChoiceGrid } from '@/components/exercise-engine/ChoiceGrid'
import { buildRecallOptions } from './peripheralSymbols'

type PeripheralRecallProps = {
  correctSymbol: string
  onSubmit: (wasCorrect: boolean) => void
}

const FEEDBACK_DELAY_MS = 1200

// Thin wrapper around the existing, unmodified ChoiceGrid — a real
// recognition-memory recall check (1 real symbol + 3 distractors), not a
// gaze/camera measurement.
export function PeripheralRecall({ correctSymbol, onSubmit }: PeripheralRecallProps): React.JSX.Element {
  const [choices] = useState(() => buildRecallOptions(correctSymbol))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isFeedback, setIsFeedback] = useState(false)

  const handleSelect = useCallback(
    (index: number) => {
      if (isFeedback) return
      setSelectedIndex(index)
      setIsFeedback(true)
    },
    [isFeedback],
  )

  useEffect(() => {
    if (!isFeedback || selectedIndex === null) return
    const timer = setTimeout(() => onSubmit(selectedIndex === choices.correctIndex), FEEDBACK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isFeedback, selectedIndex, choices.correctIndex, onSubmit])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Recall Check</p>
        <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">What was the last symbol you noticed?</h2>
      </div>
      <ChoiceGrid
        options={choices.options}
        correctIndex={choices.correctIndex}
        onSelect={handleSelect}
        selectedIndex={selectedIndex}
        isFeedback={isFeedback}
        promptLabel="Pick the symbol you last saw near the edge of your screen"
      />
    </div>
  )
}
