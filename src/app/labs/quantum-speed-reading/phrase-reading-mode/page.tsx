import type { Metadata } from 'next'
import { PhraseReadingModeExperience } from '@/features/phrase-reading-mode/components/PhraseReadingModeExperience'

export const metadata: Metadata = {
  title: 'Phrase Reading Mode — Quantum Speed Reading Lab™',
}

// Sprint 3.2 — Phrase Reading Mode™, the Master Reading Engine's second
// mode. Deliberately a distinct route from the existing, unrelated
// /phrase-reading (V1 exercise) — no collision, no shared files.
// Ungated and not yet linked from Library/Lab Home nav, same posture as
// Vertical Word Reading before its own nav-wiring sprint. No LabNavHeader —
// immersive reading screen with its own self-contained exit control.
export default function PhraseReadingModePage(): React.JSX.Element {
  return <PhraseReadingModeExperience />
}
