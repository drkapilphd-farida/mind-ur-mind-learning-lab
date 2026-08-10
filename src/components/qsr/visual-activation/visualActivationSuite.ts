import { Eye, EyeOff, Infinity, Sparkles, Timer, Wind, Zap } from 'lucide-react'
import type { VisualActivationExerciseMeta } from './types'

// Visual Activation Suite™ — the full, ordered 7-exercise roadmap. This
// is the SUITE's own internal registry, used only for the "what's coming
// next" display inside VisualActivationSuiteExperience.tsx — it is
// deliberately NEVER imported by anything paywall/gating-related.
// src/features/visual-intelligence/visualActivationSequence.ts is the
// separate, minimal, gating-facing export (currently just Exercise 1,
// since a gate can only require what's actually completable) — the two
// lists are allowed to diverge, and always will until every exercise
// here ships.
export const VISUAL_ACTIVATION_SUITE: readonly VisualActivationExerciseMeta[] = [
  {
    id: 'theta-breathing-anchor',
    order: 1,
    title: 'Theta Breathing & Focal Anchor',
    summary: 'A calming alpha/theta breathing warm-up with a synchronized glowing focal anchor.',
    trains: 'Nervous-system calm, breath-paced focus',
    icon: Wind,
    isImplemented: true,
  },
  {
    id: 'cardinal-oculomotor-stretches',
    order: 2,
    title: 'Cardinal Oculomotor Stretches',
    summary: 'Guided up/down/left/right eye-muscle stretches that build tracking control before fast reading.',
    trains: 'Ocular muscle tracking',
    icon: Eye,
    isImplemented: false,
  },
  {
    id: 'infinity-figure-eight-gliding',
    order: 3,
    title: 'Infinity Figure-8 Gliding',
    summary: 'A smooth figure-8 tracking path that trains both eyes to move together as one.',
    trains: 'Binocular coordination',
    icon: Infinity,
    isImplemented: false,
  },
  {
    id: 'peripheral-flash-expander',
    order: 4,
    title: 'Peripheral Flash Expander',
    summary: 'Extreme-corner flashes that stretch your usable visual field outward.',
    trains: 'Eye span expansion',
    icon: Zap,
    isImplemented: false,
  },
  {
    id: 'quantum-tachistoscope-multi-word-blast',
    order: 5,
    title: 'Quantum Tachistoscope Multi-Word Blast',
    summary: 'Rapid multi-word flashes that train your eyes to take in whole chunks at once.',
    trains: 'Multi-word chunking',
    icon: Sparkles,
    isImplemented: false,
  },
  {
    id: 'aura-edge-color-pulsing',
    order: 6,
    title: 'Aura Edge Color Pulsing',
    summary: 'Pulsing color cues at the very edge of your vision, trained without ever looking directly at them.',
    trains: 'Side-vision sensitivity',
    icon: EyeOff,
    isImplemented: false,
  },
  {
    id: 'blink-trigger-micro-recall',
    order: 7,
    title: 'Blink-Trigger Micro-Recall',
    summary: 'A word appears for a single blink-length instant — then you recall it from memory.',
    trains: 'Rapid visual-to-memory transfer',
    icon: Timer,
    isImplemented: false,
  },
]
