'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlaceholderStimulusImage } from './PlaceholderStimulusImage'

const STIMULUS_DISPLAY_MS = 800

type ScreenStimulusProps = {
  onComplete: () => void
}

// Displays the placeholder stimulus briefly, then auto-advances. No
// buttons, no interaction — the user only watches.
export function ScreenStimulus({ onComplete }: ScreenStimulusProps): React.JSX.Element {
  useEffect(() => {
    const timer = setTimeout(onComplete, STIMULUS_DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <PlaceholderStimulusImage />
      </motion.div>
    </div>
  )
}
