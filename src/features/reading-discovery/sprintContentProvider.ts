import type { DifficultyTier } from '@/types/exercise-engine'
import type { ComprehensionQuestion } from './types'
import type { ReadingSprintId } from './readingSprints'

// Reading Runtime Engine™ (Sprint-2 Part-2) — one real item in a
// continuous Sprint runtime. `text` covers real reading content
// (Word/Phrase/Sentence/Paragraph); `question` covers Reading
// Understanding's own real comprehension questions exclusively — per
// Sprint-2.6B FIX-20, real questions exist in exactly one place per
// session, never embedded inside another Sprint's own reading.
export type SprintContentItem = { kind: 'text'; id: string; text: string } | { kind: 'question'; id: string; question: ComprehensionQuestion }

export type SprintContentRequest = {
  targetCount: number
  // Sprint-2.5 FIX-03 — real content/question ids already used *earlier
  // in this same real session* (by a previous Sprint), so a later Sprint
  // never surfaces the identical real content twice. Reading
  // Understanding draws its real questions from the same underlying
  // sentence/paragraph pools Sentence/Paragraph Sprint already read from
  // — without this, the same real sentence/paragraph could honestly (not
  // maliciously) surface again as a question.
  excludeIds?: readonly string[]
}

// Per your explicit instruction: "the runtime, scoring, adaptation, and
// gamification must remain completely independent of the content
// source." `useContinuousSprintRuntime` only ever calls
// `getItems` — never a dataset/query function directly. Mirrors the real
// `ContentProvider<TContent>` interface already built in the Foundation
// sprint (`discover-learning-potential/content/DynamicContentProvider.ts`),
// specialized for this feature's own real per-Sprint item shape rather
// than force-fitting a second, awkward generic.
export type SprintContentProvider = {
  getItems: (sprint: ReadingSprintId, tier: DifficultyTier, request: SprintContentRequest) => readonly SprintContentItem[]
}
