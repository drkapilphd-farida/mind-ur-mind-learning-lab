import type { ModelCapability } from './ModelCapability'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — the descriptive, static facts about one model,
// mirroring `provider-adapter-layer`'s own "Adapter Metadata" section
// precedent (name/version/models/context/output/features) adapted to a
// single model rather than a whole provider. `providerId` is a plain
// `string` — self-contained, never imported from
// `provider-selection-engine`. `contextSize` is the "Context Size"
// selection dimension (§ brief).
export type ModelMetadata = {
  readonly id: string
  readonly providerId: string
  readonly displayName: string
  readonly contextSize: number
  readonly maxOutputTokens: number
  readonly supportedCapabilities: readonly ModelCapability[]
}
