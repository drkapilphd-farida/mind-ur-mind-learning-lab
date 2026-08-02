export type SprintSceneKind = 'stimulus' | 'question'

const STIMULUS_XP = 40
const QUESTION_XP = 20

// Reading Discovery Engine™ (Sprint-2 Part-1) — a real, flat, disclosed
// participation reward. Never tied to correctness — none of these
// interactions are scored ("never expose... wrong... failed"), the same
// discipline every stage of this Discovery arc already follows. Not a
// performance formula (that's real "Reading Engine" scoring work,
// explicitly deferred) — just an honest, deterministic acknowledgement
// that a real stimulus was read or a real question was answered.
export function computeSprintXpAward(sceneKind: SprintSceneKind): number {
  return sceneKind === 'stimulus' ? STIMULUS_XP : QUESTION_XP
}
