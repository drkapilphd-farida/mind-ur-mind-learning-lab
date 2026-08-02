import type { MemorySpecification } from '@/features/memory-persistence'
import type { SessionContext } from '@/features/memory-session-context'
import type { ContextSizeLimits } from '../sizeManagement'

// The pipeline's single input value. `specification` is this sprint's
// direct reuse of Sprint 14's existing query/filter infrastructure —
// callers build it with `@/features/memory-persistence`'s own
// `createTypeSpecification`/`createCombinedSpecification`/etc., never
// a parallel filtering mechanism invented here. `sessionContext` is
// Sprint 15's `SessionContext`, `null` when assembling without an
// active session.
export type ContextAssemblyInput = {
  readonly userId: string
  readonly specification: MemorySpecification
  readonly sessionContext: SessionContext | null
  readonly limits: ContextSizeLimits
}
