'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneHook } from './SceneHook'
import { ScenePrediction, type Prediction } from './ScenePrediction'
import { BrainMoment, type BrainMomentResult, type StimulusObject } from './BrainMoment'
import { EvidenceCard } from './EvidenceCard'
import { SceneDiscovery } from './SceneDiscovery'
import { SceneSurprise } from './SceneSurprise'
import { SceneNextMystery } from './SceneNextMystery'
import { PersistentBrain } from './PersistentBrain'

type Scene =
  | 'hook'
  | 'prediction'
  | 'moment-1'
  | 'moment-2'
  | 'moment-3'
  | 'evidence'
  | 'discovery'
  | 'surprise'
  | 'next-mystery'

// Three distinct arrangements of the same three object types (shape,
// color, face) — same categories every time so a pattern across all three
// taps is meaningful, different positions every time so this isn't a
// memorized layout.
const MOMENT_OBJECTS: Record<'moment-1' | 'moment-2' | 'moment-3', readonly StimulusObject[]> = {
  'moment-1': [
    { type: 'shape', topPercent: 22, leftPercent: 25 },
    { type: 'color', topPercent: 28, leftPercent: 78 },
    { type: 'face', topPercent: 76, leftPercent: 50 },
  ],
  'moment-2': [
    { type: 'face', topPercent: 20, leftPercent: 75 },
    { type: 'shape', topPercent: 72, leftPercent: 22 },
    { type: 'color', topPercent: 48, leftPercent: 18 },
  ],
  'moment-3': [
    { type: 'color', topPercent: 18, leftPercent: 50 },
    { type: 'face', topPercent: 52, leftPercent: 20 },
    { type: 'shape', topPercent: 55, leftPercent: 80 },
  ],
}

const MOMENT_NAMES: Record<'moment-1' | 'moment-2' | 'moment-3', string> = {
  'moment-1': 'The First Glance™',
  'moment-2': 'The Second Glance™',
  'moment-3': 'The Third Glance™',
}

// Mystery-1 — "Your Eyes See... But What Does Your Brain Notice?™". Nine
// scenes, local state only: prediction, three brain-moment captures, and
// the surprise answer. No scoring, no AI, no persistence beyond this
// session.
export function MysteryExperience(): React.JSX.Element {
  const [scene, setScene] = useState<Scene>('hook')
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  // Stored for this session only — nothing downstream reads it yet (no
  // scoring, no adaptive engine per this chapter's scope).
  const [, setMomentResults] = useState<BrainMomentResult[]>([])
  // Increments once per Brain Moment transition — drives PersistentBrain's
  // one-shot glow pulse (Rule 5), without ever remounting the brain itself.
  const [pulseSignal, setPulseSignal] = useState(0)

  const handleMomentCapture = useCallback((currentScene: 'moment-1' | 'moment-2' | 'moment-3', next: Scene) => {
    return (result: BrainMomentResult) => {
      setMomentResults((prev) => [...prev, result])
      setPulseSignal((p) => p + 1)
      setScene(next)
    }
  }, [])

  return (
    <>
      <PersistentBrain pulseSignal={pulseSignal} />
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          {scene === 'hook' && <SceneHook onContinue={() => setScene('prediction')} />}

          {scene === 'prediction' && (
            <ScenePrediction selected={prediction} onSelect={setPrediction} onContinue={() => setScene('moment-1')} />
          )}

          {scene === 'moment-1' && (
            <BrainMoment
              momentName={MOMENT_NAMES['moment-1']}
              order={1}
              objects={MOMENT_OBJECTS['moment-1']}
              onCapture={handleMomentCapture('moment-1', 'moment-2')}
            />
          )}

          {scene === 'moment-2' && (
            <BrainMoment
              momentName={MOMENT_NAMES['moment-2']}
              order={2}
              objects={MOMENT_OBJECTS['moment-2']}
              onCapture={handleMomentCapture('moment-2', 'moment-3')}
            />
          )}

          {scene === 'moment-3' && (
            <BrainMoment
              momentName={MOMENT_NAMES['moment-3']}
              order={3}
              objects={MOMENT_OBJECTS['moment-3']}
              onCapture={handleMomentCapture('moment-3', 'evidence')}
            />
          )}

          {scene === 'evidence' && <EvidenceCard onComplete={() => setScene('discovery')} />}

          {scene === 'discovery' && <SceneDiscovery onContinue={() => setScene('surprise')} />}

          {scene === 'surprise' && <SceneSurprise onContinue={() => setScene('next-mystery')} />}

          {scene === 'next-mystery' && <SceneNextMystery />}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
