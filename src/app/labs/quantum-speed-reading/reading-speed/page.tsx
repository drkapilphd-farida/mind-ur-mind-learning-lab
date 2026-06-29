import type { Metadata } from 'next'
import { ReadingSpeedExperience } from '@/features/quantum-speed-reading/components/ReadingSpeedExperience'

export const metadata: Metadata = {
  title: 'Reading Speed — Quantum Speed Reading Lab™',
  description: "Let's build a smooth, comfortable reading rhythm.",
}

export default function ReadingSpeedPage(): React.JSX.Element {
  return <ReadingSpeedExperience />
}
