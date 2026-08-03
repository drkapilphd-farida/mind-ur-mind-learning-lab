import type { Metadata } from 'next'
import { Suspense } from 'react'
import { QuantumSpeedReadingIntroExperience } from './components/QuantumSpeedReadingIntroExperience'

export const metadata: Metadata = {
  title: 'Quantum Speed Reading™ — Quantum Mind Learning Lab™',
  description: 'A motivational bridge from Reading Discovery into your Quantum Speed Reading™ journey.',
}

// Sprint-2.5 FIX-08 — a real, dedicated placeholder screen (per your own
// explicit direction: never a redirect to Upload, never an auto-created
// Learning Project). `useSearchParams` requires a Suspense boundary at
// the page level in the App Router.
export default function QuantumSpeedReadingIntroPage(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <QuantumSpeedReadingIntroExperience />
    </Suspense>
  )
}
