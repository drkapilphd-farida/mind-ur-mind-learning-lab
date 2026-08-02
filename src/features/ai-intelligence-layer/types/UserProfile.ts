// A deliberately minimal identity shape — just enough for the Prompt
// Composition Engine to address the learner by name. No email, no
// auth state, no PII beyond a display name — "No database dependency"
// means this layer never queries for more than a caller hands it.
export type UserProfile = {
  id: string
  displayName: string
}
