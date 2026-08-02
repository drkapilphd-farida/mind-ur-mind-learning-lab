// Learning Mode Runtime Integration™ (LSE-4). Plain data, not a thrown
// Error — the same Result-type convention every layer in this arc uses.
// `mode-not-registered` and `unsupported-chunk-strategy` are the two real,
// checkable failures this integration layer itself can produce, distinct
// from (and never overlapping with) LSE-2's own `RuntimeActionErrorCode`.
export type ModeIntegrationErrorCode = 'mode-not-registered' | 'unsupported-chunk-strategy'

export type ModeIntegrationError = {
  code: ModeIntegrationErrorCode
  message: string
}
