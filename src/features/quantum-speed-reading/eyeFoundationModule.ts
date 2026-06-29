// The locked Eye Foundation Module sequence (see docs/QUANTUM_SPEED_READING_CURRICULUM.md).
// Single source of truth for order, copy, and routing — the landing page and
// the progress system both read from this instead of each hardcoding the list.
export type EyeFoundationExercise = {
  exerciseId: string
  title: string
  summary: string
  href: string
}

export const EYE_FOUNDATION_MODULE: readonly EyeFoundationExercise[] = [
  {
    exerciseId: 'eye-warm-up',
    title: 'Eye Warm-up',
    summary: 'Loosen up your eyes with easy, continuous motion before anything else.',
    href: '/labs/quantum-speed-reading/eye-warm-up',
  },
  {
    exerciseId: 'eye-stretch',
    title: 'Eye Stretch',
    summary: 'Gently extend how far your eyes can comfortably move.',
    href: '/labs/quantum-speed-reading/eye-stretch',
  },
  {
    exerciseId: 'eye-span',
    title: 'Eye Span',
    summary: 'Notice more at once, without moving your eyes.',
    href: '/labs/quantum-speed-reading/eye-span',
  },
  {
    exerciseId: 'regression-control',
    title: 'Regression Control',
    summary: 'Practice moving steadily forward, without looking back.',
    href: '/labs/quantum-speed-reading/regression-control',
  },
  {
    exerciseId: 'reading-speed',
    title: 'Reading Speed',
    summary: 'Build a smooth, comfortable reading rhythm with real text.',
    href: '/labs/quantum-speed-reading/reading-speed',
  },
  {
    exerciseId: 'rsvp',
    title: 'RSVP',
    summary: 'Recognize single words at a fixed point, without moving your eyes.',
    href: '/labs/quantum-speed-reading/rsvp',
  },
] as const
