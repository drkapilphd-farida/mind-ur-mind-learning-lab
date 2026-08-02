import type { ContextAssemblyInput } from './ContextAssemblyInput'
import type { ContextAssemblyResult } from './ContextAssemblyResult'

// "Collects candidate memories, Applies existing query/filter
// infrastructure, Applies retention eligibility, Applies session
// context rules, Produces a final immutable ContextPackage. Reuse
// existing infrastructure wherever possible." Also this sprint's
// Section 6 ("Pipeline Orchestration Service... Pipeline execution,
// Validation, Packaging, Diagnostics generation") — one method that
// performs the whole pipeline, since every stage after collection is a
// pure function this same class composes; there is no separate
// "orchestrator wrapping a pipeline" split to make here.
export interface ContextAssemblyPipeline {
  assemble(input: ContextAssemblyInput): Promise<ContextAssemblyResult>
}
