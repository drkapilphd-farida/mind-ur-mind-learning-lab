import type { Metadata } from 'next'
import { ThirtyDayCurriculumExperience } from '@/features/thirty-day-curriculum/components/ThirtyDayCurriculumExperience'

export const metadata: Metadata = {
  title: '30-Day Quantum Speed Reading Mastery Curriculum — Quantum Speed Reading Lab™',
}

// 30-Day Quantum Speed Reading Mastery Curriculum™ — a single route,
// client-state-driven view machine (see ThirtyDayCurriculumExperience's
// own doc comment). Deliberately its own route, no collision with the
// existing 21-Day Journey's `/labs/quantum-speed-reading/journey/[day]`.
export default function ThirtyDayCurriculumPage(): React.JSX.Element {
  return <ThirtyDayCurriculumExperience />
}
