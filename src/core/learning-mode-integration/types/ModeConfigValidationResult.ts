import type { ModeIntegrationError } from './ModeIntegrationError'

// Learning Mode Runtime Integration™ (LSE-4). Pure validation result —
// reuses `ModeIntegrationError` verbatim rather than defining a second,
// parallel error shape for what is, structurally, the same kind of real
// failure.
export type ModeConfigValidationResult = { valid: true } | { valid: false; error: ModeIntegrationError }
