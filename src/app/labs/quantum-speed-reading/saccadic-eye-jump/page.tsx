import type { Metadata } from 'next'
import { SaccadicEyeJumpExperience } from '@/features/brain-gym/components/SaccadicEyeJumpExperience'

export const metadata: Metadata = {
  title: 'Saccadic Eye Jump™ — Quantum Speed Reading Lab™',
  description: 'A dot flashes left or right — tap the matching side. Trains the rapid eye jumps (saccades) real reading relies on.',
}

export default function SaccadicEyeJumpPage(): React.JSX.Element {
  return <SaccadicEyeJumpExperience />
}
