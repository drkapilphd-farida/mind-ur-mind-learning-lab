import type { Metadata } from 'next'
import { DynamicChunkSlidingExperience } from '@/features/dynamic-chunk-sliding/components/DynamicChunkSlidingExperience'

export const metadata: Metadata = {
  title: 'Dynamic Chunk Sliding — Quantum Speed Reading Lab™',
}

// Dynamic Chunk Sliding™ — the third advanced training exercise, alongside
// Schulte Grid Speed Drill™ and Rapid Visual Span Expander™. Deliberately
// its own route/folder; no collision with any existing V1 route (including
// the unrelated chunk-reading/progressive-chunk-reading routes — this
// mode's continuous sliding-chunk mechanic is a distinct design, see
// dynamicChunkSlidingDataset.ts / DynamicChunkSlidingCanvas.tsx).
export default function DynamicChunkSlidingPage(): React.JSX.Element {
  return <DynamicChunkSlidingExperience />
}
