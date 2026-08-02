'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PlaceholderStimulusImage } from './PlaceholderStimulusImage'

export type TapCapture = {
  xPercent: number
  yPercent: number
  reactionTimeMs: number
}

type ScreenResponseCaptureProps = {
  capture: TapCapture | null
  onCapture: (capture: TapCapture) => void
  onContinue: () => void
}

// Captures tap X/Y (as a percentage of the image, resolution-independent)
// and reaction time from this screen's mount to the tap. No analysis
// happens here — values are simply stored for the parent to hold.
export function ScreenResponseCapture({ capture, onCapture, onContinue }: ScreenResponseCaptureProps): React.JSX.Element {
  const mountTimeRef = useRef(performance.now())
  const containerRef = useRef<HTMLDivElement>(null)

  function handleTap(event: React.MouseEvent<HTMLDivElement>): void {
    if (capture !== null || containerRef.current === null) return
    const rect = containerRef.current.getBoundingClientRect()
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100
    const reactionTimeMs = Math.round(performance.now() - mountTimeRef.current)
    onCapture({ xPercent, yPercent, reactionTimeMs })
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="text-lg leading-8 text-muted-foreground"
      >
        Tap the <strong className="font-semibold text-foreground">first</strong> thing that naturally came to your
        mind.
      </motion.p>

      <motion.div
        ref={containerRef}
        onClick={handleTap}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative cursor-pointer"
      >
        <PlaceholderStimulusImage />
        {capture !== null && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="border-primary bg-primary/30 absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ left: `${capture.xPercent}%`, top: `${capture.yPercent}%` }}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <Button
          size="lg"
          disabled={capture === null}
          onClick={onContinue}
          className="min-w-[220px] rounded-full text-base shadow-sm"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
