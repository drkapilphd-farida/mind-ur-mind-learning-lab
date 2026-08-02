import type { FinishReason } from './FinishReason'
import type { MappedError } from './MappedError'
import type { ResponseMetadata } from './ResponseMetadata'
import type { ResponseUsage } from './ResponseUsage'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — the fully-assembled, normalized response.
export type ResponseEnvelope = {
  readonly requestId: string
  readonly providerId: string
  readonly content: string
  readonly finishReason: FinishReason
  readonly usage: ResponseUsage
  readonly metadata: ResponseMetadata
  readonly error: MappedError | null
}
