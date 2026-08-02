import type { Metadata } from 'next'
import { SentenceReadingModeExperience } from '@/features/sentence-reading-mode/components/SentenceReadingModeExperience'

export const metadata: Metadata = {
  title: 'Sentence Reading Mode — Quantum Speed Reading Lab™',
}

// Sprint 3.3 — Sentence Reading Mode™, the Master Reading Engine's third
// mode. Deliberately a distinct route from the existing, unrelated
// /sentence-reading (V1 exercise) — no collision, no shared files.
// Ungated and not yet linked from Library/Lab Home nav, same posture as
// the other two modes. No LabNavHeader — immersive reading screen with its
// own self-contained exit control (via ReadingLayout).
export default function SentenceReadingModePage(): React.JSX.Element {
  return <SentenceReadingModeExperience />
}
