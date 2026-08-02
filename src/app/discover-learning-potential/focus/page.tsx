import type { Metadata } from 'next'
import { FocusDiscoveryExperience } from './components/FocusDiscoveryExperience'

export const metadata: Metadata = {
  title: 'Focus Discovery™ — Mind Ur Mind Learning Lab™',
  description: "Let's discover how your brain naturally manages attention. There are no right or wrong answers.",
}

// Focus Discovery Foundation™ (Sprint-1) — an observation-only
// experience, not a test: one continuous real interaction per mission,
// no scores, no timers, no progress percentages.
export default function FocusDiscoveryPage(): React.JSX.Element {
  return <FocusDiscoveryExperience />
}
