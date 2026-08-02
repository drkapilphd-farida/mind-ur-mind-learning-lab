import type { ProviderSelectionCriteria } from '../types'
import type { AIProvider } from './AIProvider'

// The pure selection algorithm, factored out of ProviderFactory: given
// an already-narrowed candidate list (ProviderFactory owns fetching
// candidates from the registry) and selection criteria, pick one. Kept
// separate from ProviderFactory so the algorithm itself is swappable by
// dependency injection — e.g. a future cost-optimized resolver — without
// ProviderFactory or ProviderRegistry ever changing. Throws (never
// returns undefined) when nothing in `candidates` satisfies `criteria`,
// same contract as ProviderFactory.resolve.
export interface ProviderResolver {
  resolve(candidates: readonly AIProvider[], criteria: ProviderSelectionCriteria): AIProvider
}
