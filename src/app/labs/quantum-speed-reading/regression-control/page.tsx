import type { Metadata } from 'next'
import { RegressionControlExperience } from '@/features/quantum-speed-reading/components/RegressionControlExperience'

export const metadata: Metadata = {
  title: 'Regression Control — Quantum Speed Reading Lab™',
  description: "Let's practice moving steadily forward, without looking back.",
}

export default function RegressionControlPage(): React.JSX.Element {
  return <RegressionControlExperience />
}
