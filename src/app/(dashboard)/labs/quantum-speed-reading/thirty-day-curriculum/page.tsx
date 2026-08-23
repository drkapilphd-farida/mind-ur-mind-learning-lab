import type { Metadata } from 'next'
import { ThirtyDayCurriculumExperience } from '@/features/thirty-day-curriculum/components/ThirtyDayCurriculumExperience'
import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'

export const metadata: Metadata = {
  title: '30-Day Quantum Speed Reading Mastery Curriculum — Quantum Speed Reading Lab™',
}

// 30-Day Quantum Speed Reading Mastery Curriculum™ — a single route,
// client-state-driven view machine (see ThirtyDayCurriculumExperience's
// own doc comment). Deliberately its own route, no collision with the
// existing 21-Day Journey's `/labs/quantum-speed-reading/journey/[day]`.
//
// 30-Day Masterclass Paywall™ — the real gate resolves here, server-side,
// once per page load, via the same hasQuantumSpeedReadingProAccess() every
// other Pro-gated lab route in this app already uses. isPro is then
// threaded down as a prop — never re-derived client-side.
export default async function ThirtyDayCurriculumPage(): Promise<React.JSX.Element> {
  const isPro = await hasQuantumSpeedReadingProAccess()
  return <ThirtyDayCurriculumExperience isPro={isPro} />
}
