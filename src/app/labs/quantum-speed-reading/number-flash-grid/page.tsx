import type { Metadata } from 'next'
import { NumberFlashGridExperience } from '@/features/number-flash-grid/components/NumberFlashGridExperience'

export const metadata: Metadata = {
  title: 'Number Flash Grid — Quantum Speed Reading Lab™',
}

// Number Flash Grid™ — the second Right Brain Activation exercise,
// distinct from every Reading Mode and every other advanced training
// exercise (a gamified numerical flash-then-recall grid, not paced
// reading or a click-search drill). Deliberately its own route/folder, no
// collision with any existing route.
export default function NumberFlashGridPage(): React.JSX.Element {
  return <NumberFlashGridExperience />
}
