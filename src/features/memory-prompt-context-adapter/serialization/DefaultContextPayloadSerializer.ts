import type { ContextPayload, ContextPayloadMetadata, ContextPayloadSection } from '../domain'
import { CURRENT_PAYLOAD_VERSION } from '../domain'
import { isSupportedPayloadVersion } from '../validation'
import { isValidContextPayloadShape } from './isValidContextPayloadShape'
import { InvalidContextPayloadError } from './InvalidContextPayloadError'
import type { SerializedContextPayload } from './SerializedContextPayload'
import type { ContextPayloadSerializer } from './ContextPayloadSerializer'

// Implements ContextPayloadSerializer. "Version compatibility" means
// `deserialize()`/`validateIntegrity()` accept any version
// `isSupportedPayloadVersion()` recognizes, not only
// `CURRENT_PAYLOAD_VERSION` — `serialize()` itself always stamps the
// current version, since this engine never writes an old-version
// payload on purpose.
export class DefaultContextPayloadSerializer implements ContextPayloadSerializer {
  serialize(payload: ContextPayload): SerializedContextPayload {
    return {
      version: CURRENT_PAYLOAD_VERSION,
      payload: {
        id: payload.id,
        sections: payload.sections.map((section) => ({
          id: section.id,
          priority: section.priority,
          references: section.references.map((reference) => ({ ...reference })),
        })),
        metadata: { ...payload.metadata },
      },
    }
  }

  validateIntegrity(serialized: SerializedContextPayload): boolean {
    return isSupportedPayloadVersion(serialized.version) && isValidContextPayloadShape(serialized.payload)
  }

  deserialize(serialized: SerializedContextPayload): ContextPayload {
    if (!this.validateIntegrity(serialized)) throw new InvalidContextPayloadError(serialized.version)

    const payload = serialized.payload
    return {
      id: payload.id as string,
      sections: payload.sections as readonly ContextPayloadSection[],
      metadata: payload.metadata as ContextPayloadMetadata,
    }
  }
}

export function createContextPayloadSerializer(): ContextPayloadSerializer {
  return new DefaultContextPayloadSerializer()
}
