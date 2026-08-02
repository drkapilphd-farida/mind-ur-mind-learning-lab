'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { computeLiveWpm } from '@/features/quantum-speed-reading/readingSessionEngine'

type ReadingSprintViewProps = {
  content: string
  onComplete: (wpm: number) => void
}

const SPRINT_DURATIONS_SECONDS = [30, 60, 90] as const

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Reading Sprint™. A
// real, honest WPM figure needs a real "words read" signal — with no
// scroll/eye instrumentation over a single, usually screen-sized real
// chunk, the honest measure this mode uses is the real chunk's own real
// word count divided by the real elapsed time until the learner marks it
// done (whether that's before or right at the countdown's own end) — the
// same `computeLiveWpm` formula `readingSessionEngine.ts` already uses
// for the Lab's own passage-based reading, reused verbatim, never
// reimplemented.
export function ReadingSprintView({ content, onComplete }: ReadingSprintViewProps): React.JSX.Element {
  const [durationSeconds, setDurationSeconds] = useState<(typeof SPRINT_DURATIONS_SECONDS)[number] | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  useEffect(() => {
    if (startedAt === null) return
    if (secondsLeft <= 0) {
      onComplete(computeLiveWpm(countWords(content), Date.now() - startedAt))
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, startedAt])

  function handleStart(seconds: (typeof SPRINT_DURATIONS_SECONDS)[number]): void {
    setDurationSeconds(seconds)
    setSecondsLeft(seconds)
    setStartedAt(Date.now())
  }

  function handleDone(): void {
    if (startedAt === null) return
    onComplete(computeLiveWpm(countWords(content), Date.now() - startedAt))
  }

  if (durationSeconds === null) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <p className={TYPOGRAPHY.h4}>Choose a sprint length</p>
        <div className="flex gap-3">
          {SPRINT_DURATIONS_SECONDS.map((seconds) => (
            <Button key={seconds} variant="outline" onClick={() => handleStart(seconds)}>
              {seconds}s
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      <p className={cn(TYPOGRAPHY.h3, 'text-center tabular-nums')}>{secondsLeft}s</p>
      <p className="mx-auto max-w-[65ch] text-lg leading-relaxed whitespace-pre-wrap text-foreground sm:text-xl sm:leading-loose">{content}</p>
      <div className="flex justify-center pt-2">
        <Button onClick={handleDone}>Done Reading</Button>
      </div>
    </div>
  )
}
