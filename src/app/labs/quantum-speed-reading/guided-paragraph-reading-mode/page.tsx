import type { Metadata } from 'next'
import { GuidedParagraphReadingModeExperience } from '@/features/guided-paragraph-reading-mode/components/GuidedParagraphReadingModeExperience'

export const metadata: Metadata = {
  title: 'Guided Paragraph Reading Mode — Quantum Speed Reading Lab™',
}

// Guided Paragraph Reading Mode™ — the Master Reading Engine's fifth and
// final mode. Deliberately its own route/folder, with no route collision
// against any existing V1 or V2 exercise. Ungated, same "reachable by
// direct URL, and now linked from the Reading Hub" posture the other 4
// modes have.
export default function GuidedParagraphReadingModePage(): React.JSX.Element {
  return <GuidedParagraphReadingModeExperience />
}
