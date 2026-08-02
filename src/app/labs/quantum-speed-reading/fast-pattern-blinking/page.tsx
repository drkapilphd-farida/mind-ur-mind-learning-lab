import type { Metadata } from 'next'
import { FastPatternBlinkingExperience } from '@/features/brain-gym/components/FastPatternBlinkingExperience'

export const metadata: Metadata = {
  title: 'Fast Pattern Blinking™ — Quantum Speed Reading Lab™',
  description: 'A symbol blinks for a split second, then vanishes. Catch it before it’s gone.',
}

export default function FastPatternBlinkingPage(): React.JSX.Element {
  return <FastPatternBlinkingExperience />
}
