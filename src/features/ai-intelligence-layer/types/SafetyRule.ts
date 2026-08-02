// One centralized safety rule — "No medical advice," "No hallucinated
// scores," etc. `id` is stable and kebab-case so a rule can be
// referenced (e.g. in a test asserting a specific rule is present)
// without string-matching its prose description.
export type SafetyRule = {
  id: string
  description: string
}
