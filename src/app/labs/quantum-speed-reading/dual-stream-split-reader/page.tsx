import type { Metadata } from 'next'
import { DualStreamSplitReaderExperience } from '@/features/dual-stream-split-reader/components/DualStreamSplitReaderExperience'

export const metadata: Metadata = {
  title: 'Dual-Stream Split Reader — Quantum Speed Reading Lab™',
}

// Dual-Stream Split Reader™ — a flagship Reading Intelligence Hub
// exercise: the Dual-Column Synchronized RSVP/Chunk Engine, built on the
// exact same shared 25-module content library Flash Recall & Retention
// Sprint uses (see dualStreamSplitReaderDataset.ts's own doc comment). No
// LabNavHeader — immersive reading screen with its own self-contained exit
// control (via ReadingLayout).
export default function DualStreamSplitReaderPage(): React.JSX.Element {
  return <DualStreamSplitReaderExperience />
}
