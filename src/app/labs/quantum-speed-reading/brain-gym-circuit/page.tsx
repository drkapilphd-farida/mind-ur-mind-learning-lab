import type { Metadata } from 'next'
import { BrainGymCircuitExperience } from '@/features/brain-gym/components/BrainGymCircuitExperience'

export const metadata: Metadata = {
  title: '2-Minute Brain Gym Circuit™ — Quantum Speed Reading Lab™',
  description: '4 quick micro-drills back to back — about 2 minutes total, real and scored but fast.',
}

export default function BrainGymCircuitPage(): React.JSX.Element {
  return <BrainGymCircuitExperience />
}
