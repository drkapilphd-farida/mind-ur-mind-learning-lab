import type { Metadata } from 'next'
import { EyeSpanExperience } from '@/features/quantum-speed-reading/components/EyeSpanExperience'

export const metadata: Metadata = {
  title: 'Eye Span — Quantum Speed Reading Lab™',
  description: "Let's see how much your eyes can take in at once, without moving them.",
}

export default function EyeSpanPage(): React.JSX.Element {
  return <EyeSpanExperience />
}
