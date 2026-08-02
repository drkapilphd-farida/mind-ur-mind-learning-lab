import type { MemoryCategory } from './MemoryCategory'

// "Collect memory candidates" — raw input handed to MemoryBuilder,
// never fetched or invented by this feature ("No fake learner data" —
// same discipline every prior sprint in this arc has followed).
// `data` is a plain, opaque bag — this feature never interprets its
// contents, only carries it through.
export type MemoryCandidate = {
  learnerId: string
  category: MemoryCategory
  summary: string
  occurredAt: string
  data: Record<string, unknown>
}
