// QSR Pro Circuit™ — pure rotation logic, no I/O, no React. Deterministic
// per user per calendar day: same user always sees the same pick on the
// same day (no persisted rotation state needed), different users spread
// across the pool on the same day. Mirrors the exact rotation pattern
// already proven in quantum-journey/quantumJourneyLevels.ts's
// getStep1AndStep2/getReadingMode ((day - 1) % pool.length), adapted for
// a feature with no explicit "journey day" counter — the day number comes
// from the real UTC calendar date instead.

// Phase 2 (Visual Activation) rotation pool — every exercise here already
// exposes `onComplete?: (accuracyPercent: number) => void` except Schulte
// Grid (`onComplete?: () => void`, no accuracy concept), and all are
// already embedded safely elsewhere (6 of 7 proven in production by
// QuantumJourneySession.tsx). Index 0 is the classic Visual Activation
// drill itself — free-tier users are always pinned to it (see
// RotatingVisualActivationPhase.tsx).
export const PHASE_2_POOL_IDS = [
  'visual-activation',
  'schulte-grid-drill',
  'esp-zener-telepathy',
  'photographic-memory',
  'color-scene-transformation',
  'hemispheric-color-sync',
  'quantum-mental-rotation',
  'quantum-hidden-target-grid',
] as const

export type Phase2PoolExerciseId = (typeof PHASE_2_POOL_IDS)[number]

// Phase 3 (Quantum Reading Sprint) rotation pool. Index 0 is the bespoke
// Quantum Reading Sprint drill — the ONLY pick whose result carries a
// `selectedSet: ReadingSet` compatible with Phase 4 (Retention Check).
// Every other pick is a real reading exercise but produces a
// `ReadingSessionResult` (averageWpm/completionPercent/etc.), not a
// passage+quiz — on those days the Circuit skips Retention Check
// entirely (see UnifiedQuantumSession.tsx's 3-vs-4-step branch), same
// accommodation QuantumJourneySession.tsx already makes for its own
// rotating Dynamic Chunking day.
export const PHASE_3_POOL_IDS = [
  'quantum-reading-sprint',
  'rapid-visual-span-expander',
  'dynamic-chunk-sliding',
  'flash-recall-sprint',
  'vertical-word-reading',
  'guided-paragraph-reading-mode',
] as const

export type Phase3PoolExerciseId = (typeof PHASE_3_POOL_IDS)[number]

function getEpochDayNumber(date: Date): number {
  return Math.floor(date.getTime() / 86_400_000) // UTC calendar day index
}

// Deterministic small-int hash of the user's uuid — same user always maps
// to the same offset, spreading different users across the pool on the
// same calendar day instead of everyone seeing the identical exercise.
function hashUserId(userId: string): number {
  let hash = 0
  for (let index = 0; index < userId.length; index++) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

// `phaseSalt` decorrelates Phase 2 and Phase 3's picks (different salts)
// so they don't always advance in lockstep across days.
function pickPoolIndex(poolLength: number, userId: string, phaseSalt: number, date: Date): number {
  if (poolLength <= 0) return 0
  return (getEpochDayNumber(date) + hashUserId(userId) + phaseSalt) % poolLength
}

export function pickPhase2ExerciseId(userId: string, date: Date = new Date()): Phase2PoolExerciseId {
  const index = pickPoolIndex(PHASE_2_POOL_IDS.length, userId, 0, date)
  return PHASE_2_POOL_IDS[index] ?? PHASE_2_POOL_IDS[0]
}

export function pickPhase3ExerciseId(userId: string, date: Date = new Date()): Phase3PoolExerciseId {
  const index = pickPoolIndex(PHASE_3_POOL_IDS.length, userId, 1, date)
  return PHASE_3_POOL_IDS[index] ?? PHASE_3_POOL_IDS[0]
}

// XP for a Phase 2 rotation pick lacking its own XP formula — mirrors
// computeReadingXp's exact shape (quantumReadingSprintDataset.ts) and
// computeVisualActivationXp's base (visualActivationDataset.ts): a flat
// floor plus half the real, measured accuracy — never a fabricated
// number regardless of performance.
export function computePoolExerciseXp(accuracyPercent: number): number {
  return 50 + Math.round(accuracyPercent * 0.5)
}
