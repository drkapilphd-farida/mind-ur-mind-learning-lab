import type { Metadata } from 'next'
import { ImageFlashGridExperience } from '@/features/image-flash-grid/components/ImageFlashGridExperience'

export const metadata: Metadata = {
  title: 'Image Flash Grid — Quantum Speed Reading Lab™',
}

// Image Flash Grid™ — the fourth and final Right Brain Activation
// flash-grid exercise, distinct from every Reading Mode and every other
// advanced training exercise (a gamified pure photographic icon
// flash-then-recall grid, not paced reading or a click-search drill).
// Deliberately its own route/folder, no collision with any existing
// route.
export default function ImageFlashGridPage(): React.JSX.Element {
  return <ImageFlashGridExperience />
}
