'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScreenHumanTruth } from './ScreenHumanTruth'
import { ScreenPrediction, type PredictionOption } from './ScreenPrediction'
import { ScreenStimulus } from './ScreenStimulus'
import { ScreenResponseCapture, type TapCapture } from './ScreenResponseCapture'
import { ScreenEvidence } from './ScreenEvidence'
import { ScreenMicroReveal } from './ScreenMicroReveal'

type PrototypeStep = 'human-truth' | 'prediction' | 'stimulus' | 'response-capture' | 'evidence' | 'micro-reveal'

// Founder Prototype™ vs001 — exactly six fixed screens, local state only.
// Nothing is persisted, no API calls, no analysis — every captured value
// (prediction, tap coordinates, reaction time) is simply held in memory
// for this session and discarded on reload. Reuses the parent
// discover-your-brain layout's background, container, and MotionConfig —
// no layout of its own.
export function PrototypeExperience(): React.JSX.Element {
  const [step, setStep] = useState<PrototypeStep>('human-truth')
  const [prediction, setPrediction] = useState<PredictionOption | null>(null)
  const [tapCapture, setTapCapture] = useState<TapCapture | null>(null)

  const restart = useCallback(() => {
    setStep('human-truth')
    setPrediction(null)
    setTapCapture(null)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full"
      >
        {step === 'human-truth' && <ScreenHumanTruth onContinue={() => setStep('prediction')} />}
        {step === 'prediction' && (
          <ScreenPrediction selected={prediction} onSelect={setPrediction} onContinue={() => setStep('stimulus')} />
        )}
        {step === 'stimulus' && <ScreenStimulus onComplete={() => setStep('response-capture')} />}
        {step === 'response-capture' && (
          <ScreenResponseCapture capture={tapCapture} onCapture={setTapCapture} onContinue={() => setStep('evidence')} />
        )}
        {step === 'evidence' && <ScreenEvidence onReveal={() => setStep('micro-reveal')} />}
        {step === 'micro-reveal' && <ScreenMicroReveal onContinue={restart} />}
      </motion.div>
    </AnimatePresence>
  )
}
