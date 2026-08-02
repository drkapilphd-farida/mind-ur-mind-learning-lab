// AI Learning Studio™ Sprint ALS-4 — "Learning Objective." Deliberately
// kept outside generateLearningBlueprint.ts's own seeded-mock pipeline:
// this derives only from the one input that's genuinely real on this
// screen — the document's real title — and makes no claim about the
// material's actual content or structure, unlike a fabricated specific
// objective would.
export function deriveLearningObjective(documentTitle: string): string {
  return `Understand and retain the key ideas in "${documentTitle}."`
}
