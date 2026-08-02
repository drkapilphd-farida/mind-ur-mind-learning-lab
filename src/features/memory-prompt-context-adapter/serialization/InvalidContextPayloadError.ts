// Thrown by DefaultContextPayloadSerializer.deserialize() for a
// structurally invalid or unsupported-version SerializedContextPayload
// — a real, catchable failure, never a silently-malformed ContextPayload.
export class InvalidContextPayloadError extends Error {
  constructor(version: number) {
    super(`Invalid or unsupported serialized context payload (version ${version}).`)
    this.name = 'InvalidContextPayloadError'
  }
}
