'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

type ScreenHumanTruthProps = {
  onContinue: () => void
}

export function ScreenHumanTruth({ onContinue }: ScreenHumanTruthProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="font-heading text-4xl leading-[1.2] font-semibold tracking-tight text-foreground sm:text-5xl"
      >
        Every second...
        <br />
        your eyes receive thousands of pieces of information.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
        className="mx-auto max-w-lg text-lg leading-8 text-muted-foreground"
      >
        Your brain silently decides what deserves your attention. Today you&apos;ll discover one small part of that
        process.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
      >
        <Button size="lg" onClick={onContinue} className="min-w-[220px] rounded-full text-base shadow-sm">
          Discover
        </Button>
      </motion.div>
    </div>
  )
}
