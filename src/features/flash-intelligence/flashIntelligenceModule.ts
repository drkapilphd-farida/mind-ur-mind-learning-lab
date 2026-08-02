import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'

// The Flash Intelligence Pack™ sequence — mirrors EYE_FOUNDATION_MODULE's
// and READING_EXPANSION_MODULE's exact shape/style. Single source of truth
// for order/gating: Word Flash (Mission 1) → Number Flash (2) → Symbol
// Flash (3) → Mixed Flash (4, the Boss Mission) → Peripheral Flash (5,
// Visual Span Training) — the same numbering these 5 exercises' own page
// metadata already describes.
export const FLASH_INTELLIGENCE_MODULE: readonly ExerciseSequenceItem[] = [
  {
    exerciseId: 'word-flash',
    title: 'Word Flash',
    summary: 'A word flashes briefly — identify it before it disappears.',
    href: '/labs/quantum-speed-reading/word-flash',
  },
  {
    exerciseId: 'number-flash',
    title: 'Number Flash',
    summary: 'Train your brain to recognize numbers instantly.',
    href: '/labs/quantum-speed-reading/number-flash',
  },
  {
    exerciseId: 'symbol-flash',
    title: 'Symbol Flash',
    summary: 'Train ultra-fast visual recognition using symbols instead of words.',
    href: '/labs/quantum-speed-reading/symbol-flash',
  },
  {
    exerciseId: 'mixed-flash',
    title: 'Mixed Flash',
    summary: 'Words, numbers, and symbols — the brain never knows which is coming next.',
    href: '/labs/quantum-speed-reading/mixed-flash',
  },
  {
    exerciseId: 'peripheral-flash',
    title: 'Peripheral Flash',
    summary: 'Keep your eyes on the center. Recognize what appears around it.',
    href: '/labs/quantum-speed-reading/peripheral-flash',
  },
] as const
