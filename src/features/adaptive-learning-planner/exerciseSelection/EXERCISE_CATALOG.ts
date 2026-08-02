import type { SkillArea } from '../types'

// Illustrative exercise slugs, not a live lookup into any real lab's
// exercise catalog — same "placeholder, to be confirmed" honesty
// pattern as `@/features/ai-provider-configuration/catalog/MODEL_REGISTRY.ts`
// (Sprint 6). A future integration maps these onto real exercise ids.
export const EXERCISE_CATALOG: Record<SkillArea, readonly string[]> = {
  reading: ['reading-warm-up', 'reading-speed-drill', 'reading-comprehension-check'],
  memory: ['memory-recall-drill', 'memory-pattern-practice'],
  focus: ['focus-attention-drill', 'focus-concentration-practice'],
  general: ['general-review-session'],
}
