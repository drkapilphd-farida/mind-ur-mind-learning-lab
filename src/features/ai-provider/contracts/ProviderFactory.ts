import type { ProviderSelectionCriteria } from '../types'
import type { AIProvider } from './AIProvider'

// Resolves one AIProvider from a ProviderRegistry given selection
// criteria — "Support selecting providers by: provider id, preferred
// model, fallback model, capabilities, future pricing." `resolve`
// throws (a real NoMatchingProviderError, see factory/) rather than
// returning undefined when nothing satisfies the criteria — a genuine
// failure mode, never silently swallowed.
export interface ProviderFactory {
  resolve(criteria: ProviderSelectionCriteria): AIProvider
}
