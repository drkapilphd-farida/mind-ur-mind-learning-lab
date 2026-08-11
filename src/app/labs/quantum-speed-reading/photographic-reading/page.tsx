import type { Metadata } from 'next'
import { PhotographicReadingExperience } from '@/features/photographic-reading/components/PhotographicReadingExperience'

export const metadata: Metadata = {
  title: 'Photographic Reading — Quantum Speed Reading Lab™',
}

// Photographic Reading™ — a flagship Reading Intelligence Hub exercise:
// the Spatial Quadrant Flashing Engine, built on the exact same shared
// 25-module content library Flash Recall & Retention Sprint uses (see
// photographicReadingDataset.ts's own doc comment). No LabNavHeader —
// immersive reading screen with its own self-contained exit control (via
// ReadingLayout).
export default function PhotographicReadingPage(): React.JSX.Element {
  return <PhotographicReadingExperience />
}
