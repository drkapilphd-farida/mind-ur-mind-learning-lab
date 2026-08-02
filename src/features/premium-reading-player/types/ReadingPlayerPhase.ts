// The outer session-shell phase PremiumReadingPlayer owns. Deliberately
// coarser than the child engines' own internal phases (UniversalExercisePlayer's
// idle/countdown/playing/paused/completed) — this feature never reimplements
// those; `active` simply means "the caller-supplied experience is mounted."
export type ReadingPlayerPhase = 'welcome' | 'mission' | 'active' | 'completed'
