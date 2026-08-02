'use client'

import { motion } from 'framer-motion'

// The elegant animated focus point — a single calm, breathing dot. No
// challenge logic lives here; this is purely what the user rests their
// eyes on once observation begins (and continues after, since the actual
// interactive challenge arrives in the next screen).
export function FocusPoint(): React.JSX.Element {
  return (
    <motion.div
      aria-hidden="true"
      className="size-4 rounded-full bg-primary"
      initial={{ opacity: 0.6, scale: 0.9 }}
      animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.08, 0.9] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
