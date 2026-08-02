import type { MemoryContextSection } from './MemoryContextSection'

// MemoryContext™ — "Merge memory context. Prepare future AI context."
// The final, AI-ready shape: grouped by category, already compressed
// (see MemoryCompressor) to a bounded size. A future real mentor
// conversation embeds each section's summaries into its own prompt —
// this feature never builds a prompt string itself ("Architecture
// only").
export type MemoryContext = {
  learnerId: string
  sections: readonly MemoryContextSection[]
  generatedAt: string
}
