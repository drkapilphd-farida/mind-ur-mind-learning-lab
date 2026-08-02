'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrainIllustration } from './BrainIllustration'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const LINES = ['The most fascinating journey...', '...is into your own mind.', "Let's discover yours."] as const

const LINE_FADE_IN_S = 0.3
const LINE_FADE_OUT_S = 0.25

type ScaleMode = 'breathing' | 'still' | 'pulsing'

type WelcomeHeroProps = {
  onBrainTap: () => void
  onOpeningComplete: () => void
}

// Top label + headline + supporting copy + hero illustration. The brain is
// tappable — tapping it does NOT swap in a different component or route.
// This exact component, and the exact BrainIllustration instance inside
// it, stays mounted for the entire Opening Experience™: the surrounding
// content swaps from headline/copy to the line sequence, the brain is
// animated in place via the same wrapping motion.div, and a fixed white
// overlay fades in right before onOpeningComplete fires. Nothing here
// ever unmounts the brain.
export function WelcomeHero({ onBrainTap, onOpeningComplete }: WelcomeHeroProps): React.JSX.Element {
  const [tapped, setTapped] = useState(false)
  const [scaleMode, setScaleMode] = useState<ScaleMode>('breathing')
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [screenFading, setScreenFading] = useState(false)

  function handleTap(): void {
    if (tapped) return
    setTapped(true)
    onBrainTap()
  }

  useEffect(() => {
    if (!tapped) return undefined

    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, fn: () => void): void => {
      timers.push(setTimeout(fn, ms))
    }

    // Breathing stops immediately on tap; brain holds still, then one
    // gentle pulse, then settles for the rest of the sequence.
    setScaleMode('still')
    at(300, () => setScaleMode('pulsing'))
    at(900, () => setScaleMode('still'))

    at(500, () => setActiveLine(0))
    at(1800, () => setActiveLine(null))
    at(2200, () => setActiveLine(1))
    at(3400, () => setActiveLine(null))
    at(3800, () => setActiveLine(2))
    at(4800, () => setActiveLine(null))

    at(5200, () => setScreenFading(true))
    at(5400, onOpeningComplete)

    return () => timers.forEach(clearTimeout)
  }, [tapped, onOpeningComplete])

  const scaleAnimate = scaleMode === 'pulsing' ? [1, 1.04, 1] : scaleMode === 'breathing' ? [1, 1.015, 1] : 1
  const scaleTransition =
    scaleMode === 'pulsing'
      ? { duration: 0.6, ease: 'easeInOut' as const }
      : scaleMode === 'breathing'
        ? { duration: 4, ease: 'easeInOut' as const, repeat: Infinity }
        : { duration: 0.15, ease: 'easeInOut' as const }

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Entire-screen fade to white right before navigating — an overlay
          layer inside this same component, not a route or component swap. */}
      <AnimatePresence>
        {screenFading && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div animate={{ scale: scaleAnimate }} transition={scaleTransition}>
          <button
            type="button"
            onClick={handleTap}
            disabled={tapped}
            aria-label="Discover your brain"
            className="cursor-pointer rounded-full disabled:cursor-default"
          >
            <BrainIllustration />
          </button>
        </motion.div>
      </motion.div>

      {!tapped ? (
        <>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }} className="mt-10">
            <p className="text-sm font-medium text-muted-foreground">Welcome to</p>
            <p className="font-heading text-lg font-semibold text-foreground">Mind Ur Mind Learning Lab™</p>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.65, ease: 'easeOut' }}
            className="mt-6 font-heading text-4xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-5xl"
          >
            Your Brain.
            <br />
            Your Potential.
            <br />
            Your Transformation.
          </motion.h1>

          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }} className="mt-6 space-y-4">
            <p className="text-lg leading-8 text-muted-foreground">
              Every extraordinary transformation begins with understanding yourself.
            </p>
            <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground">
              Over the next few minutes you&apos;ll discover how your brain naturally learns, reads, remembers and
              focuses. Every step that follows will be personalized just for you.
            </p>
          </motion.div>
        </>
      ) : (
        <div className="mt-10 flex h-10 w-full max-w-[600px] items-center justify-center px-6" aria-live="polite">
          <AnimatePresence mode="wait">
            {activeLine !== null && (
              <motion.p
                key={activeLine}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: LINE_FADE_IN_S, ease: 'easeOut' } }}
                exit={{ opacity: 0, transition: { duration: LINE_FADE_OUT_S, ease: 'easeOut' } }}
                className="font-heading text-center text-3xl font-semibold tracking-wide text-foreground sm:text-4xl"
              >
                {LINES[activeLine]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
