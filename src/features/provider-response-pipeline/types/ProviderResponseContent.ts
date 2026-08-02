import type { ProviderResponseFinishReason } from './ProviderResponseFinishReason'

// Immutable — every field `readonly`. `text` is passed through from
// the raw provider response unchanged — this feature normalizes
// *shape*, never generates or rewrites content.
export type ProviderResponseContent = {
  readonly text: string
  readonly finishReason: ProviderResponseFinishReason
}
