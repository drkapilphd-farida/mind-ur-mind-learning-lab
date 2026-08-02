import type { Metadata } from 'next'
import { FlashRecallSprintExperience } from '@/features/flash-recall-sprint/components/FlashRecallSprintExperience'

export const metadata: Metadata = {
  title: 'Flash Recall & Retention Sprint — Quantum Speed Reading Lab™',
}

// Flash Recall & Retention Sprint™ — the fourth and final advanced
// training exercise, alongside Schulte Grid Speed Drill™, Rapid Visual
// Span Expander™, and Dynamic Chunk Sliding™. Deliberately its own
// route/folder; no collision with any existing V1 route (including the
// unrelated word-flash/symbol-flash/mixed-flash/number-flash/peripheral-
// flash routes — this mode's flash-then-recall-question mechanic is a
// distinct design, see flashRecallSprintDataset.ts / FlashRecallSprintCanvas.tsx).
export default function FlashRecallSprintPage(): React.JSX.Element {
  return <FlashRecallSprintExperience />
}
