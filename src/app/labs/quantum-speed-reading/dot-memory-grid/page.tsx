import type { Metadata } from 'next'
import { DotMemoryGridExperience } from '@/features/dot-memory-grid/components/DotMemoryGridExperience'

export const metadata: Metadata = {
  title: 'Dot Memory Grid — Quantum Speed Reading Lab™',
}

// Dot Memory Grid™ — a Right Brain Activation exercise, distinct from
// every Reading Mode and every other advanced training exercise (a
// gamified spatial memorize-then-tap grid, not paced reading or a
// click-search drill). Deliberately its own route/folder, no collision
// with any existing route.
export default function DotMemoryGridPage(): React.JSX.Element {
  return <DotMemoryGridExperience />
}
