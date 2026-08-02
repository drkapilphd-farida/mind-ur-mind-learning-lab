// Sprint 8's own richer error taxonomy — "Normalize provider errors
// into one shared format... Authentication Error, Configuration Error,
// Rate Limit, Unavailable Provider, Timeout, Unknown Provider."
// Deliberately a new, Sprint-8-owned type rather than an addition to
// ai-provider's frozen AIErrorCode (Sprint 5, "do not modify any
// previous sprint") — 'configuration-error' has no equivalent there.
// DefaultProviderErrorNormalizer produces this; each real adapter's own
// ErrorTranslator (satisfying Sprint 5's own contract) maps this down
// to Sprint 5's AIError shape for BaseProviderAdapter to actually use.
export type ProviderErrorCode = 'authentication-error' | 'configuration-error' | 'rate-limit' | 'unavailable-provider' | 'timeout' | 'unknown-provider'
