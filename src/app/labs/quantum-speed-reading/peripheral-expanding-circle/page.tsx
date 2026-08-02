import type { Metadata } from 'next'
import { PeripheralExpandingCircleExperience } from '@/features/brain-gym/components/PeripheralExpandingCircleExperience'

export const metadata: Metadata = {
  title: 'Peripheral Expanding Circle™ — Quantum Speed Reading Lab™',
  description: 'Catch a dot flashing in your peripheral vision without moving your eyes from center.',
}

export default function PeripheralExpandingCirclePage(): React.JSX.Element {
  return <PeripheralExpandingCircleExperience />
}
