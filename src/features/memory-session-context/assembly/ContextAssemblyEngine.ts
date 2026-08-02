import type { ContextEntry } from '../domain'

// "Build current session context, Merge relevant memory references,
// Preserve ordering, Prevent duplicate entries. No AI inference or
// semantic processing." — a pure, deterministic merge only.
export interface ContextAssemblyEngine {
  assemble(existingEntries: readonly ContextEntry[], incomingEntries: readonly ContextEntry[]): readonly ContextEntry[]
}
