import type { ContextPackage, ContextSizeLimits } from '@/features/memory-context-assembly'
import type { ContextPayload } from '../domain'

// "Create a provider-neutral adapter contract. Responsibilities:
// Transform ContextPackage, Preserve ordering, Preserve references,
// Preserve metadata, Produce immutable payload. No provider-specific
// formatting." `payloadLimits` is optional — `null` means no
// additional payload-level trim beyond what the source package already
// had applied.
export interface ContextAdapter {
  transform(contextPackage: ContextPackage, payloadLimits: ContextSizeLimits | null): ContextPayload
}
