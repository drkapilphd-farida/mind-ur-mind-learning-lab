import type { Metadata } from 'next'
import { PhotographicMemoryExperience } from '@/features/photographic-memory/components/PhotographicMemoryExperience'

export const metadata: Metadata = {
  title: 'Photographic Memory — Quantum Speed Reading Lab™',
}

// Photographic Memory™ — the first Right Brain Activation exercise,
// rebranded and expanded from the retired "Mandala Photographic Memory
// Dash™" (mandala patterns are now one of 4 content categories, not the
// whole exercise). Deliberately its own route/folder, no collision with
// any existing V1 or V2 route, including the unrelated "Mandala Tratak"
// gaze-fixation feature under the visual-intelligence lab.
export default function PhotographicMemoryPage(): React.JSX.Element {
  return <PhotographicMemoryExperience />
}
