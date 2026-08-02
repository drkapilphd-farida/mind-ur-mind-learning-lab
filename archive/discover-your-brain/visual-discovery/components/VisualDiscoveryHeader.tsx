'use client'

import { motion } from 'framer-motion'

// Two lines only — "almost no reading" per the brief. No eyebrow, no
// paragraph, nothing to explain.
export function VisualDiscoveryHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="font-heading text-4xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-5xl"
      >
        Visual Discovery™
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        className="mt-4 text-lg leading-8 text-muted-foreground"
      >
        Simply observe.
        <br />
        Nothing more.
      </motion.p>
    </div>
  )
}
