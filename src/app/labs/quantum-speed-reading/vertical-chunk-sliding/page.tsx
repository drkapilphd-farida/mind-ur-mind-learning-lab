import type { Metadata } from 'next'
import { VerticalChunkSlidingExperience } from '@/features/vertical-chunk-sliding/components/VerticalChunkSlidingExperience'

export const metadata: Metadata = {
  title: 'Vertical Chunk Sliding — Quantum Speed Reading Lab™',
}

// Vertical Chunk Sliding™ — the vertical companion to Dynamic Chunk
// Sliding™. Its own route/folder, no collision with any existing route.
export default function VerticalChunkSlidingPage(): React.JSX.Element {
  return <VerticalChunkSlidingExperience />
}
