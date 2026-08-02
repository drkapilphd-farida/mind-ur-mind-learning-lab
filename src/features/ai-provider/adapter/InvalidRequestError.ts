// Thrown by CapabilityValidator when a request violates a model's real
// limits (empty messages, requested output exceeding the model's
// maxOutputTokens, estimated input exceeding its contextWindowTokens)
// — a genuine domain failure, translated to AIErrorCode
// 'invalid-request' by ErrorTranslator, same pattern as every other
// local error class in this feature.
export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidRequestError'
  }
}
