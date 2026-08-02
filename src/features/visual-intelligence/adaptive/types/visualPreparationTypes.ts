// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Mirrors fixationTypes.ts/persistenceChallengeTypes.ts's record shape —
// the first record type ever written for visual_preparation_sessions
// (Sprint-4 shipped no route and no query file for this table).

export type VisualPreparationSessionRecord = {
  durationSeconds: number
  completed: boolean
  occurredAt: string
}

export type ImagePersistenceSessionRecord = {
  durationSeconds: number
  completed: boolean
  occurredAt: string
}
