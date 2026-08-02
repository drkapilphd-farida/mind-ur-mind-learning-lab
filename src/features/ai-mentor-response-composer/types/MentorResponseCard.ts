// Immutable — every field `readonly`. A labeled group of raw
// structured values (ids, categories, stringified counts) —
// `values: readonly string[]`, never a `body: string`, structurally
// prevents assembled prose from creeping in here.
export type MentorResponseCard = {
  readonly id: string
  readonly title: string
  readonly values: readonly string[]
}
