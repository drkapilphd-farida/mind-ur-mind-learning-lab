import type { Metadata } from 'next'
import { SchulteGridDrillExperience } from '@/features/schulte-grid-drill/components/SchulteGridDrillExperience'

export const metadata: Metadata = {
  title: 'Schulte Grid Speed Drill — Quantum Speed Reading Lab™',
}

// Schulte Grid Speed Drill™ — the first advanced warmup exercise, distinct
// from every Reading Mode (visual focus/peripheral search, not paced
// reading). Deliberately its own route/folder, no collision with any
// existing V1 or V2 route.
export default function SchulteGridDrillPage(): React.JSX.Element {
  return <SchulteGridDrillExperience />
}
