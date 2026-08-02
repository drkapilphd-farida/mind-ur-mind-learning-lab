import type { LearningAssetObject } from '@/core/universal-learning-engine/learning-assets'
import type { AssessmentAssets } from '@/core/universal-learning-engine/learning-blueprint'
import type { AssessmentExerciseAsset } from '../types/ExerciseAsset'

export type BuildAssessmentExerciseAssetsOptions = {
  idFactory?: (index: number) => string
}

// The real, exact question template buildStructuralAssessmentItems.ts
// (Sprint 1) already uses for every mcq it has ever produced —
// `What is the definition of "<term>"?`. StructuralMcqItem carries no
// object reference of its own, so this pattern is the only way to
// recover one locally, matching the codebase's own "match by real text"
// precedent (Sprint 3's normalizeForMatching).
const DEFINITION_QUESTION_PATTERN = /^What is the definition of "(.+)"\?$/

function resolveSourceObjectId(question: string, objectsByTitle: ReadonlyMap<string, LearningAssetObject>): string | null {
  const match = DEFINITION_QUESTION_PATTERN.exec(question)
  const term = match?.[1]
  if (term === undefined) return null
  return objectsByTitle.get(term.trim().toLowerCase())?.objectId ?? null
}

// Exercise Asset Builder™ — Assessment Exercise Asset. A field rename
// (question -> prompt, options -> options, correctAnswerIndex ->
// correctIndex) over AssessmentAssets.mcqs, already generated with zero
// AI by buildStructuralAssessmentItems.ts (Sprint 1) — the strongest
// reuse case in the whole Exercise Asset catalogue (Sprint QSR-0.5,
// Part 3). sourceObjectId is the one real Join this function performs;
// a question whose term doesn't resolve against this chapter's own
// learningObjects (should not happen for output this codebase's own
// pipeline produced) degrades honestly to null, never a guess.
export function buildAssessmentExerciseAssets(
  mcqs: AssessmentAssets['mcqs'],
  sourceChapterId: string,
  learningObjects: readonly LearningAssetObject[],
  options: BuildAssessmentExerciseAssetsOptions = {},
): readonly AssessmentExerciseAsset[] {
  const idFactory = options.idFactory ?? ((index) => `${sourceChapterId}-mcq-${index}`)
  const objectsByTitle = new Map(learningObjects.map((object) => [object.title.trim().toLowerCase(), object] as const))

  return mcqs.map((mcq, index) => ({
    id: idFactory(index),
    prompt: mcq.question,
    options: mcq.options,
    correctIndex: mcq.correctAnswerIndex,
    sourceObjectId: resolveSourceObjectId(mcq.question, objectsByTitle),
    questionKind: 'definition' as const,
  }))
}
