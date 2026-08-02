import type { ContextPackage, ContextSizeLimits } from '@/features/memory-context-assembly'
import type { ContextPayload, ContextPayloadSection } from '../domain'
import { CURRENT_PAYLOAD_VERSION } from '../domain'
import { trimPayloadSections } from './trimPayloadSections'

// Pure — "Transform ContextPackage, Preserve ordering, Preserve
// references, Preserve metadata, Produce immutable payload. No
// provider-specific formatting. No prompt templates. No
// natural-language generation." A structural, 1:1 remapping of every
// section and reference, in the exact given order, plus provenance
// metadata (`sourcePackageId`/`sourcePackageVersion`) this payload
// carries that the source package itself has no reason to.
export function transformContextPackage(
  contextPackage: ContextPackage,
  now: string,
  id: string,
  payloadLimits: ContextSizeLimits | null,
): ContextPayload {
  const sections: readonly ContextPayloadSection[] = contextPackage.sections.map((section) => ({
    id: section.id,
    priority: section.priority,
    references: section.references.map((reference) => ({
      memoryId: reference.memoryId,
      priority: reference.priority,
      reason: reference.reason,
    })),
  }))

  return {
    id,
    sections: payloadLimits ? trimPayloadSections(sections, payloadLimits) : sections,
    metadata: {
      sessionId: contextPackage.metadata.sessionId,
      sourcePackageId: contextPackage.id,
      sourcePackageVersion: contextPackage.metadata.version,
      generatedAt: now,
      payloadVersion: CURRENT_PAYLOAD_VERSION,
    },
  }
}
