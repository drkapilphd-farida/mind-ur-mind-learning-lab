import type { ProviderContext } from './ProviderContext'
import type { ProviderInstruction } from './ProviderInstruction'
import type { ProviderMessage } from './ProviderMessage'
import type { ProviderProfileId } from './ProviderProfileId'
import type { ProviderRequestMetadata } from './ProviderRequestMetadata'

// Immutable — every field `readonly`. This engine's whole output — one
// provider-neutral request contract per translation run, tagged with
// which profile produced it. No literal name collision (confirmed via
// repo-wide grep), unlike Sprints 26/28/30's forced renames. Assembly
// stops here: no translation to a real provider SDK payload, no
// network call — "Only schema translation. No API implementation."
export type ProviderRequest = {
  readonly id: string
  readonly version: number
  readonly providerId: ProviderProfileId
  readonly context: ProviderContext
  readonly messages: readonly ProviderMessage[]
  readonly instructions: readonly ProviderInstruction[]
  readonly metadata: ProviderRequestMetadata
}
