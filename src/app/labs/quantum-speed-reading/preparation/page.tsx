import type { Metadata } from 'next'
import { ReadingPreparationSequence } from '@/features/quantum-speed-reading/components/ReadingPreparationSequence'
import { ProLockedScreen } from '@/components/exercises/ProLockedScreen'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'

export const metadata: Metadata = {
  title: 'Reading Preparation™ — Quantum Speed Reading Lab™',
  description: 'Prepare your eyes and brain before beginning high-speed reading.',
}

export default async function ReadingPreparationPage(): Promise<React.JSX.Element> {
  // Quantum Speed Reading Paywall™ — Reading Preparation™ requires Pro.
  // Visual Activation™ is no longer part of this journey (rebuilt as the
  // standalone "Brain Gym" pillar), so it's no longer a prerequisite here.
  if (!(await hasQuantumSpeedReadingProAccess())) {
    return <ProLockedScreen title="Reading Preparation™" />
  }

  return <ReadingPreparationSequence />
}
