// Immutable — every field `readonly`. "Memory Summary References"
// (Sprint 28 §4) — a structural component (not one of the brief's 5
// named domain models), one entry per AI Memory Engine™ context
// section summary. Real reduction happens in
// `../integration/buildMentorMemoryReferences.ts`.
export type MentorMemoryReference = {
  readonly memoryId: string
  readonly summary: string
}
