import type { ContextPayload } from '../domain'
import type { SerializedContextPayload } from './SerializedContextPayload'

// "Serialize, Deserialize, Version compatibility, Integrity
// validation. Reuse existing serialization patterns where
// appropriate." `validateIntegrity()` is the real gate — `deserialize()`
// always calls it first and throws rather than producing a malformed
// ContextPayload from bad data.
export interface ContextPayloadSerializer {
  serialize(payload: ContextPayload): SerializedContextPayload
  deserialize(serialized: SerializedContextPayload): ContextPayload
  validateIntegrity(serialized: SerializedContextPayload): boolean
}
