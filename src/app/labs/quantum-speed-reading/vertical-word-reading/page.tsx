import type { Metadata } from 'next'
import { VerticalWordReadingExperience } from '@/features/vertical-word-reading/components/VerticalWordReadingExperience'

export const metadata: Metadata = {
  title: 'Vertical Word Reading — Quantum Speed Reading Lab™',
}

// Vertical Word Reading Engine™ — now backed by its own feature folder
// (src/features/vertical-word-reading/), redesigned around a GPU-
// accelerated teleprompter waterfall over a genuine 25-category
// vocabulary library. No LabNavHeader — this is an immersive reading
// screen, which per that component's own convention gets its own self-
// contained exit control instead of persistent chrome.
export default function VerticalWordReadingPage(): React.JSX.Element {
  return <VerticalWordReadingExperience />
}
