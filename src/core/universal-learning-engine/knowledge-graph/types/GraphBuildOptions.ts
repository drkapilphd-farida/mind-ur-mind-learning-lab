import type { AIFoundation } from '@/core/ai-foundation'

// Learning Knowledge Graph™ (UCE-4). Every field is optional with a
// real, disclosed default. `aiFoundation` is the one AI seam this engine
// has — supplying it enables the one AI-derived edge type
// (`builds-upon`, via AIFoundation.execute('relationship-detection', ...)
// — never Claude/Anthropic/another provider directly). Omitting it keeps
// graph construction fully deterministic, free, and fast — required
// given "Future million-node scalability."
export type GraphBuildOptions = {
  now?: () => Date
  idFactory?: () => string
  aiFoundation?: Pick<AIFoundation, 'execute'>
}
