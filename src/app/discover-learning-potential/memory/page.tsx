import type { Metadata } from 'next'
import { MemoryDiscoveryExperience } from './components/MemoryDiscoveryExperience'

export const metadata: Metadata = {
  title: 'Memory Discovery™ — Quantum Mind Learning Lab™',
  description: "Let's discover how your memory naturally works. There are no right or wrong answers — trust your first impression.",
}

// Sprint-3 — Memory Discovery™. An observation-only experience, not an
// assessment: one tiny interaction per screen, no scores, no timers, no
// progress percentages.
export default function MemoryDiscoveryPage(): React.JSX.Element {
  return <MemoryDiscoveryExperience />
}
