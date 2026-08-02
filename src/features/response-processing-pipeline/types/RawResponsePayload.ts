import type { RawErrorPayload } from './RawErrorPayload'
import type { RawResponseMetadataPayload } from './RawResponseMetadataPayload'
import type { RawUsagePayload } from './RawUsagePayload'

// Immutable — every field `readonly`. A deterministic, caller-supplied
// stand-in for "what a provider would eventually return" — never
// fetched, never awaited, same "the caller supplies the outcome"
// determinism used throughout this arc. Self-contained — not the same
// type as the pre-existing `provider-response-pipeline`'s own
// `RawProviderResponse` (a real, exact collision this plan sidesteps
// by naming its own type differently). `ResponseValidator` operates on
// this raw shape directly, before any extraction/normalization.
export type RawResponsePayload = {
  readonly providerId: string
  readonly content: string | null
  readonly finishReason: string | null
  readonly usage: RawUsagePayload | null
  readonly metadata: RawResponseMetadataPayload | null
  readonly errorPayload: RawErrorPayload | null
}
