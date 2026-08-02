import type { Metadata } from 'next'
import { ParagraphReadingModeExperience } from '@/features/paragraph-reading-mode/components/ParagraphReadingModeExperience'

export const metadata: Metadata = {
  title: 'Paragraph Reading Mode — Quantum Speed Reading Lab™',
}

// Sprint 3.4 — Paragraph Reading Mode™, the Master Reading Engine's fourth
// mode. Deliberately a distinct route from the existing, unrelated
// /paragraph-reading (V1 mission-gated exercise) — no collision, no shared
// files. Ungated and not yet linked from the Reading Hub (deliberately
// deferred — 3.3A is locked this sprint), same "reachable by direct URL
// only" posture the other 3 modes started with.
export default function ParagraphReadingModePage(): React.JSX.Element {
  return <ParagraphReadingModeExperience />
}
