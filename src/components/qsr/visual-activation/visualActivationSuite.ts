import { Eye, EyeOff, Flame, Infinity, Sparkles, Timer, Wind, Zap } from 'lucide-react'
import type { VisualActivationExerciseMeta } from './types'

// Visual Activation Suite™ — the full, ordered 8-exercise roadmap. This
// is the SUITE's own internal registry, used only for the "what's coming
// next" display inside VisualActivationSuiteExperience.tsx. Now mounted
// as the standalone, ungated "Brain Gym" pillar (see LabPillarsGrid.tsx)
// — no longer a journey stage, so nothing here is gating-related.
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
    isImplemented: true,
  },
  {
    id: 'infinity-figure-eight-gliding',
    order: 3,
    title: 'Infinity Figure-8 Gliding',
    summary: 'A smooth figure-8 tracking path that trains both eyes to move together as one.',
    trains: 'Binocular coordination',
    icon: Infinity,
    isImplemented: true,
  },
  {
    id: 'peripheral-flash-expander',
    order: 4,
    title: 'Peripheral Flash Expander',
    summary: 'Extreme-corner flashes that stretch your usable visual field outward.',
    trains: 'Eye span expansion',
    icon: Zap,
    isImplemented: true,
  },
  {
    id: 'quantum-tachistoscope-multi-word-blast',
    order: 5,
    title: 'Quantum Tachistoscope Multi-Word Blast',
    summary: 'Rapid multi-word flashes that train your eyes to take in whole chunks at once.',
    trains: 'Multi-word chunking',
    icon: Sparkles,
    isImplemented: true,
  },
  {
    id: 'aura-edge-color-pulsing',
    order: 6,
    title: 'Aura Edge Color Pulsing',
    summary: 'Pulsing color cues at the very edge of your vision, trained without ever looking directly at them.',
    trains: 'Side-vision sensitivity',
    icon: EyeOff,
    isImplemented: true,
  },
  {
    id: 'blink-trigger-micro-recall',
    order: 7,
    title: 'Blink-Trigger Micro-Recall',
    summary: 'A word appears for a single blink-length instant — then you recall it from memory.',
    trains: 'Rapid visual-to-memory transfer',
    icon: Timer,
    isImplemented: true,
  },
  {
    id: 'tratak-afterimage-stretches',
    order: 8,
    title: 'Tratak Afterimage Stretches',
    summary: 'A classic steady-gaze practice — hold your gaze on a vivid target, then close your eyes and hold its afterimage.',
    trains: 'Sustained fixation, visual retention',
    icon: Flame,
    isImplemented: true,
  },
]
