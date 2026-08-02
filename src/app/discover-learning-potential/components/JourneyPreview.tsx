'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

const STEPS = ['Reading', 'Memory', 'Focus', 'Calm', 'Your Learning Potential Report'] as const

// Section 3 — Journey Preview. As simple as the spec asks: a plain
// vertical sequence, one closing sentence, nothing more.
export function JourneyPreview(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-md px-6 pb-24 text-center">
      <div className="flex flex-col items-center gap-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <p
              className={
                index === STEPS.length - 1
                  ? 'font-heading text-base font-semibold text-foreground'
                  : 'text-sm font-medium text-muted-foreground'
              }
            >
              {step}
            </p>
            {index < STEPS.length - 1 && <ArrowDown className="text-muted-foreground/40 size-4" aria-hidden="true" />}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        className="mt-8 text-sm leading-6 text-muted-foreground"
      >
        Each discovery is based on real learning experiences—
        <br />
        not guesswork.
      </motion.p>
    </div>
  )
}
