import type { Metadata } from 'next'
import { ChunkReadingExperience } from '@/features/chunk-reading/components/ChunkReadingExperience'

export const metadata: Metadata = {
  title: 'Chunk Reading Intelligence™ — Quantum Speed Reading Lab™',
  description: 'Train your eyes to perceive multiple words in a single fixation. Chunk size and speed adapt automatically to your performance.',
}

export default function ChunkReadingPage(): React.JSX.Element {
  return <ChunkReadingExperience />
}
