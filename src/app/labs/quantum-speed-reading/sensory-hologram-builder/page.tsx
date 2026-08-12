import type { Metadata } from 'next'
import { SensoryHologramBuilderExperience } from '@/features/sensory-hologram-builder/components/SensoryHologramBuilderExperience'

export const metadata: Metadata = {
  title: 'Sensory Hologram Builder — Quantum Speed Reading Lab™',
}

// Sensory Hologram Builder™ — a Visualization Hub exercise: a guided,
// bilingual (English/Hindi) voice-narrated journey through Grounding,
// Sight, Touch, Smell/Taste, and Full Hologram Synthesis, built on a
// 50+ item life-goals and sensory-anchor database (hologramDatabase.ts).
// Deliberately its own route/folder, no collision with any existing
// route.
export default function SensoryHologramBuilderPage(): React.JSX.Element {
  return <SensoryHologramBuilderExperience />
}
