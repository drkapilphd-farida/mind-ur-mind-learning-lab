import type { SupportedProviderId } from './SupportedProviderId'

// 'mock' is always a valid resolution target — "Current Mock Provider
// remains default" is representable in the type itself, not just
// documentation.
export type ActiveProviderId = 'mock' | SupportedProviderId
