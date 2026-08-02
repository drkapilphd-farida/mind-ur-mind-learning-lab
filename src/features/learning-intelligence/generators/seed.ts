// One shared string→number hash for every generator in this folder
// that needs deterministic pseudo-randomness (today: generateQuiz's
// distractor selection and option shuffling, via the platform's
// existing seeded Randomization Engine — `src/lib/exercise-engine/
// randomizationEngine.ts`'s `pickItems`/`shuffleArray`). Written once
// here so no two generators independently reimplement the same hash
// ("zero duplicated logic"). Deliberately not imported from Sprint 1/2's
// `generateLearningBlueprint.ts` — that file's own `seedFrom` is a
// private, unexported function in a locked, separate bounded context.
export function seedFromId(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return hash || 1
}
