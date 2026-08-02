'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

type ScreenMicroRevealProps = {
  onContinue: () => void
}

export function ScreenMicroReveal({ onContinue }: ScreenMicroRevealProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
      >
        Interesting...
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
        className="mx-auto max-w-lg text-lg leading-8 text-muted-foreground"
      >
        Your brain may naturally prioritise certain visual information before other details. This is only one small
        part of how your brain processes the world.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
      >
        <Button size="lg" onClick={onContinue} className="min-w-[220px] rounded-full text-base shadow-sm">
          Continue Discovery
        </Button>
      </motion.div>
    </div>
  )
}
