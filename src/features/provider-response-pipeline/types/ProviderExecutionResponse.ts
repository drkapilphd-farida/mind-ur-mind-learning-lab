import type { ProviderResponseContent } from './ProviderResponseContent'
import type { ProviderResponseMetadata } from './ProviderResponseMetadata'
import type { ProviderResponseProfileId } from './ProviderResponseProfileId'
import type { ProviderUsageStatistics } from './ProviderUsageStatistics'

// Immutable — every field `readonly`. This engine's whole output — one
// unified, provider-agnostic response per normalization run.
// `safetyFlags` realizes "Safety metadata" (§3) as a deterministic tag
// list (`['content-filtered']` when `content.finishReason === 'safety'`,
// else `[]`) rather than a 6th domain model. "No provider execution" —
// nothing here ever calls a provider; the raw response this normalizes
// is always synthetic/local (see this feature's own `index.ts` header).
export type ProviderExecutionResponse = {
  readonly id: string
  readonly version: number
  readonly providerId: ProviderResponseProfileId
  readonly content: ProviderResponseContent
  readonly usage: ProviderUsageStatistics
  readonly safetyFlags: readonly string[]
  readonly metadata: ProviderResponseMetadata
}
