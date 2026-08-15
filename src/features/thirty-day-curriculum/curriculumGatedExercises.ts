// The 16 catalog exercises whose own `page.tsx` runs a real server-side
// access check (`hasQuantumSpeedReadingProAccess` and/or
// `getExerciseAccess`'s sequential-unlock check) before rendering —
// confirmed by reading every one directly. DayMasterPlayer.tsx must NEVER
// render these exercises' client components directly in-page: doing so
// would skip their page.tsx entirely and silently bypass the paywall/
// sequential-unlock gate. These 16 are always handed off via a real
// navigation to their own real, gated route instead — see
// DayMasterPlayer.tsx's own doc comment.
export const CURRICULUM_GATED_EXERCISE_IDS: ReadonlySet<string> = new Set([
  // Eye Foundation Module — Pro + sequential-unlock.
  'eye-warm-up',
  'eye-stretch',
  'eye-span',
  'regression-control',
  'reading-speed',
  'rsvp',
  // Reading Expansion Module — Pro + sequential-unlock.
  'phrase-reading',
  'multi-line-reading',
  'sentence-reading',
  'paragraph-reading',
  // Flash Intelligence Pack — sequential-unlock.
  'word-flash',
  'number-flash',
  'symbol-flash',
  'mixed-flash',
  'peripheral-flash',
  // Core Reading Journey entry point — sequential-unlock.
  'progressive-chunk-reading',
])

export function isCurriculumExerciseGated(exerciseId: string): boolean {
  return CURRICULUM_GATED_EXERCISE_IDS.has(exerciseId)
}
