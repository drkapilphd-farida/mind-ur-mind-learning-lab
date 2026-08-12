import type { Metadata } from 'next'
import { WordFlashGridExperience } from '@/features/word-flash-grid/components/WordFlashGridExperience'

export const metadata: Metadata = {
  title: 'Word Flash Grid — Quantum Speed Reading Lab™',
}

// Word Flash Grid™ — the third Right Brain Activation exercise, distinct
// from every Reading Mode and every other advanced training exercise (a
// gamified visual-linguistic flash-then-recall grid, not paced reading or
// a click-search drill). Deliberately its own route/folder, no collision
// with any existing route.
export default function WordFlashGridPage(): React.JSX.Element {
  return <WordFlashGridExperience />
}
