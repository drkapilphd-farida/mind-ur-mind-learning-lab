'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type OneAtATimeRevealProps<T> = {
  items: readonly T[]
  renderItem: (item: T) => React.ReactNode
  onFinished: () => void
  continueLabel?: string
  emptyMessage?: string
}

// Reading Journey Experience™ (Sprint-5). Shared "one item at a time,
// calm, no pressure, replay allowed" pattern behind the Keyword Warm-up,
// Word Journey, and Phrase Journey screens — no timer, no auto-advance,
// no speed controls (deliberately dropped from Sprint-4.5's own version:
// this brief explicitly asks these screens to never feel like a
// flashcard app or a quiz).
//
// A genuinely empty real chapter (zero real words/phrases selected — a
// real, honest, disclosed outcome, not a bug in the data) is never
// silently skipped. An earlier version of this component called
// `onFinished()` directly during render when `items.length === 0`,
// which — for a chapter with no real words AND no real phrases — chained
// straight through two whole screens on a single click, with nothing
// ever shown to the learner: "the learner should always know where they
// are" was violated. It now shows the same honest, brief "nothing here"
// message every other empty-state screen in this journey already uses,
// with a real Continue button the learner presses themselves.
export function OneAtATimeReveal<T>({ items, renderItem, onFinished, continueLabel = 'Continue', emptyMessage = 'There is nothing to explore here for this chapter.' }: OneAtATimeRevealProps<T>): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const isLast = index >= items.length - 1

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
        <Button size="lg" onClick={onFinished}>
          Continue
        </Button>
      </div>
    )
  }

  const currentItem = items[Math.min(index, items.length - 1)] as T

  function handleContinue(): void {
    if (isLast) {
      onFinished()
      return
    }
    setIndex((current) => current + 1)
  }

  return (
    <div className="space-y-8">
      <div key={index} className="animate-in fade-in flex min-h-32 items-center justify-center duration-(--duration-base)">
        {renderItem(currentItem)}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setIndex(0)} disabled={index === 0} className={cn(index === 0 && 'invisible')}>
          <RotateCcw aria-hidden="true" />
          Replay
        </Button>
        <Button size="lg" onClick={handleContinue}>
          {isLast ? continueLabel : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
