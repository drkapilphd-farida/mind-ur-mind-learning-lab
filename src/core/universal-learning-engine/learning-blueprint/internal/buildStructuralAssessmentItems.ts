import type { ChunkDefinition, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { AssessmentAssets } from '../types/ChapterIntelligenceBlueprint'

const MAX_DISTRACTORS = 3

// Deterministic — built entirely from this chunk's own already-real
// `enrichment.definitions`, never a new AI call. Deliberately NOT
// imported from `mcqs-mode-runtime` (a feature-layer module; this is a
// core-engine module, so the dependency must not run that direction) —
// a small, Blueprint-scoped equivalent instead. `correctAnswerIndex` is
// fixed at 0; a future consuming UI is expected to shuffle for display,
// exactly like every other "store the real data, let the renderer
// decide presentation" convention in this pipeline.
function buildDefinitionMcq(target: ChunkDefinition, allDefinitions: readonly ChunkDefinition[]): AssessmentAssets['mcqs'][number] | null {
  const distractors = allDefinitions.filter((entry) => entry.term !== target.term).map((entry) => entry.definition)
  if (distractors.length === 0) return null

  return {
    question: `What is the definition of "${target.term}"?`,
    options: [target.definition, ...distractors.slice(0, MAX_DISTRACTORS)],
    correctAnswerIndex: 0,
  }
}

// Section 6 (partial) — `mcqs`/`trueFalse` only; `recallQuestions`/
// `applicationQuestions` require real synthesis and are produced by the
// one new AI call instead (see buildChapterIntelligenceBlueprint.ts).
export function buildStructuralAssessmentItems(chunk: LearningChunk): Pick<AssessmentAssets, 'mcqs' | 'trueFalse'> {
  const definitions = chunk.enrichment.definitions ?? []

  const mcqs = definitions.map((definition) => buildDefinitionMcq(definition, definitions)).filter((item): item is AssessmentAssets['mcqs'][number] => item !== null)

  const trueStatements = definitions.map((definition) => ({ statement: `${definition.term}: ${definition.definition}`, isTrue: true }))
  const falseStatements = (chunk.enrichment.misconceptions ?? []).map((misconception) => ({ statement: misconception, isTrue: false }))

  return { mcqs, trueFalse: [...trueStatements, ...falseStatements] }
}
