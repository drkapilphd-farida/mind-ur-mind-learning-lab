import type { Metadata } from 'next'
import { VerticalWordReadingExperience } from '@/features/quantum-speed-reading/components/VerticalWordReadingExperience'

export const metadata: Metadata = {
  title: 'Vertical Word Reading — Quantum Speed Reading Lab™',
}

// Sprint 3.1 — Vertical Word Reading Engine™, QSR V2's first new exercise.
// Deliberately ungated and not yet linked from the Library or Lab Home nav
// (per the sprint's own "stop here, wait for approval before 3.2" scope) —
// reachable directly by URL only, matching reports/page.tsx's open shape.
// No LabNavHeader — this is an immersive reading screen, which per that
// component's own convention gets its own self-contained exit control
// instead of persistent chrome.
export default function VerticalWordReadingPage(): React.JSX.Element {
  return <VerticalWordReadingExperience />
}
