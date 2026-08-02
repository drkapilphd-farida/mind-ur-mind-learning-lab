// Thrown by MemorySerializer.deserialize() when the payload fails
// structural validation (missing/wrong-typed fields, unknown version)
// — a real, catchable failure rather than silently producing a
// malformed Memory.
export class InvalidMemoryPayloadError extends Error {
  constructor(version: number) {
    super(`Invalid or unsupported serialized memory payload (version ${version}).`)
    this.name = 'InvalidMemoryPayloadError'
  }
}
