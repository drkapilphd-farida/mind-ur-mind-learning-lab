import type { ContextPackage } from '@/features/memory-context-assembly'
import type { SessionContext } from '@/features/memory-session-context'
import type { MemoryConfiguration } from '@/features/memory-configuration-policy'
import type { PersonalizationFacts } from '../domain'

// The raw inputs a caller supplies for one evaluation run — "Supported
// inputs: Assessment Results, Learning Progress, Memory Context,
// Session Context, Configuration," using each one's *real* type where
// "approved infrastructure" provides one (`ContextPackage`,
// `SessionContext`, `MemoryConfiguration`), and plain
// `PersonalizationFacts` where none exists (assessment results and
// learning progress have no corresponding approved feature to import
// from, so they're supplied pre-reduced by the caller).
export type EvaluationInputs = {
  readonly assessmentResults: PersonalizationFacts
  readonly learningProgress: PersonalizationFacts
  readonly memoryContext: ContextPackage | null
  readonly sessionContext: SessionContext | null
  readonly configuration: MemoryConfiguration | null
}
