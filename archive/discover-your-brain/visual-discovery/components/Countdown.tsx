'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const STEP_MS = 900
// Lets the exit animation on "1" finish before the parent switches phase,
// so the countdown never gets cut off mid-fade.
const EXIT_BUFFER_MS = 400

type CountdownProps = {
  // Delay before the first number appears, so counting starts once the
  // observation stage has actually finished fading in — not the instant
  // this component mounts underneath it.
  startDelayMs?: number
  onComplete: () => void
}

// Premium 3...2...1 — each number scales and fades into the next rather
// than snapping, like a countdown, not a digital clock.
export function Countdown({ startDelayMs = 0, onComplete }: CountdownProps): React.JSX.Element | null {
  const [started, setStarted] = useState(startDelayMs === 0)
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (started) return undefined
    const timer = setTimeout(() => setStarted(true), startDelayMs)
    return () => clearTimeout(timer)
  }, [started, startDelayMs])

  useEffect(() => {
    if (!started) return undefined
    if (count === 0) {
      const timer = setTimeout(onComplete, EXIT_BUFFER_MS)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setCount((c) => c - 1), STEP_MS)
    return () => clearTimeout(timer)
  }, [started, count, onComplete])

  if (!started || count === 0) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, scale: 1.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="font-heading text-6xl font-semibold tabular-nums text-foreground"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
