import type { Metadata } from 'next'
import { SubvocalizationDestroyerExperience } from '@/features/subvocalization-destroyer/components/SubvocalizationDestroyerExperience'

export const metadata: Metadata = {
  title: 'Subvocalization Destroyer — Quantum Speed Reading Lab™',
}

// Subvocalization Destroyer™ — a flagship Reading Intelligence Hub
// exercise: ultra-high-speed True RSVP (600-1200 WPM) built on the exact
// same shared 25-module content library Flash Recall & Retention Sprint
// uses (see subvocalizationDestroyerDataset.ts's own doc comment). No
// LabNavHeader — immersive reading screen with its own self-contained
// exit control (via ReadingLayout).
export default function SubvocalizationDestroyerPage(): React.JSX.Element {
  return <SubvocalizationDestroyerExperience />
}
