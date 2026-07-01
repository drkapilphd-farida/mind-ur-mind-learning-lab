import type { Metadata } from 'next'
import { FixationReductionExperience } from '@/features/quantum-speed-reading/components/FixationReductionExperience'

export const metadata: Metadata = {
  title: 'Fixation Reduction — Quantum Speed Reading Lab™',
  description: "Let's train your eyes to cover the same line in fewer stops.",
}

export default function FixationReductionPage(): React.JSX.Element {
  return <FixationReductionExperience />
}
