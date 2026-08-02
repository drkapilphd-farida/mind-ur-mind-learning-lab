import type { AIFoundation } from '@/core/ai-foundation'

// AI Learning Analysis Engine™ (UCE-5). Every field is optional with a
// real, disclosed default. `aiFoundation` is the one AI seam this engine
// has — supplying it enables real AI-refined strategy notes for core
// concepts only (via AIFoundation.execute('difficulty-analysis', ...) —
// never Claude/Anthropic/another provider directly). Omitting it keeps
// analysis fully deterministic, free, and fast — every one of the 18
// brief-listed outputs still gets a real, computed value; only the
// natural-language strategy refinement is skipped.
export type LearningAnalysisOptions = {
  now?: () => Date
  idFactory?: () => string
  aiFoundation?: Pick<AIFoundation, 'execute'>
}
