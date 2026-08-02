'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { FlashStimulus } from '@/components/exercise-engine/FlashStimulus'
import { ITEM_GAP_MS, POST_SEQUENCE_PAUSE_MS, READY_PULSE_MS } from '@/features/memory-discovery/memoryTimingConfig'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

type SequentialFlashCardProps = {
  // One or more stimuli, flashed ONE AT A TIME — never shown together —
  // with a blank gap between each. A single-item array (Number Recall)
  // degrades naturally: flash once, no gap, straight to the closing pause.
  items: readonly string[]
  // How long each individual item stays visible — the founder's adaptive
  // Easy/Medium/Hard/Expert ladder (see flashSpeed.ts), not a flat total.
  perItemMs: number
  onDone: () => void
  instruction?: string
  textClassName?: string
}

// Sprint-1.6 FIX-02/FIX-03/FIX-05/FIX-09/FIX-13, Sprint-2.1 FIX-05/FIX-06
// ("Zero Idle Screen Rule™") — "Memory is Rhythm, not Waiting." The old
// choreography (a 900ms framing beat, then a real 3-2-1 numeric
// countdown via `ExerciseCountdown` — three real full seconds — then a
// 250ms "Flash" beat) added ~4.15 real seconds of pure waiting before a
// single real item ever appeared. Replaced with one brief real "ready"
// pulse — long enough to register as a deliberate beat, far too short to
// feel like waiting. Sprint-2.1 FIX-12 — the real durations now live in
// the one centralized timing config.

const flashVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.12, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.1, ease: 'easeIn' } },
}

type Stage = 'ready' | 'flash' | 'gap' | 'done'

// The Flash Engine, retimed for Sprint-1.6's own continuous-rhythm goal:
// a brief real "ready" pulse (instruction text, if any, fades in and out
// within it) → one item at a time (FlashStimulus, reused as-is, driving
// each item's own hold duration) → blank → next → ... → a short replay
// pause → onDone. No new timing primitive: this only choreographs the
// one existing one (FlashStimulus) at a genuinely faster real cadence.
//
// Focus mode: once the sequence actually starts flashing, nothing else is
// on screen — no instruction label, no framing text — only the flashing
// item itself.
export function SequentialFlashCard({
  items,
  perItemMs,
  onDone,
  instruction,
  textClassName,
}: SequentialFlashCardProps): React.JSX.Element {
  const [stage, setStage] = useState<Stage>('ready')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (stage !== 'ready') return
    const timer = window.setTimeout(() => setStage('flash'), READY_PULSE_MS)
    return () => window.clearTimeout(timer)
  }, [stage])

  const handleItemHidden = useCallback((): void => {
    setStage('gap')
  }, [])

  useEffect(() => {
    if (stage !== 'gap') return
    const timer = window.setTimeout(() => {
      if (index + 1 < items.length) {
        setIndex((i) => i + 1)
        setStage('flash')
      } else {
        setStage('done')
      }
    }, ITEM_GAP_MS)
    return () => window.clearTimeout(timer)
  }, [stage, index, items.length])

  useEffect(() => {
    if (stage !== 'done') return
    const timer = window.setTimeout(onDone, POST_SEQUENCE_PAUSE_MS)
    return () => window.clearTimeout(timer)
  }, [stage, onDone])

  return (
    <MemoryExperimentLayout maxWidthClassName="max-w-lg">
      <div className="flex min-h-[140px] items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === 'ready' && instruction !== undefined && (
            <motion.p
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
            >
              {instruction}
            </motion.p>
          )}
          {stage === 'flash' && (
            <motion.div key={`item-${index}`} variants={flashVariants} initial="hidden" animate="visible" exit="exit">
              <FlashStimulus
                stimulus={items[index]!}
                durationMs={perItemMs}
                onHide={handleItemHidden}
                renderStimulus={(stimulus) => (
                  <p className={textClassName ?? 'font-heading text-3xl font-semibold text-foreground sm:text-4xl'}>{stimulus}</p>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MemoryExperimentLayout>
  )
}
