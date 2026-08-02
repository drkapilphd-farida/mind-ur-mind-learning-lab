// Immutable — every field `readonly`. A structured, actionable
// pointer — "No natural-language writing": `label` is a short
// deterministic slug (e.g. `'review-exercise'`), never an assembled
// sentence.
export type MentorAction = {
  readonly id: string
  readonly label: string
  readonly referenceId: string
}
