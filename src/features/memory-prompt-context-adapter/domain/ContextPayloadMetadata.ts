import type { ContextPayloadVersion } from './ContextPayloadVersion'

// Immutable — every field `readonly`. `sourcePackageId`/
// `sourcePackageVersion` are provenance this payload carries that
// `ContextPackage` itself has no reason to know about — a `ContextPayload`
// always remembers exactly which package (and which version of it) it
// was transformed from ("Preserve metadata").
export type ContextPayloadMetadata = {
  readonly sessionId: string | null
  readonly sourcePackageId: string
  readonly sourcePackageVersion: number
  readonly generatedAt: string
  readonly payloadVersion: ContextPayloadVersion
}
