// Gamification & XP Sync — the one real formula for a completed Quantum
// Document session (real speed-reading pass + real self-assessed Active
// Recall quiz). A flat award for finishing the sprint at all, plus a real
// per-correct-answer bonus — never a fabricated/inflated number, and never
// computed differently in two places (the Server Action is the only real
// caller; the client never persists its own guess of the reward).
export const BASE_SESSION_XP = 50
export const XP_PER_CORRECT_ANSWER = 10

export function computeQuantumDocumentSessionXp(correctAnswersCount: number): number {
  return BASE_SESSION_XP + correctAnswersCount * XP_PER_CORRECT_ANSWER
}
