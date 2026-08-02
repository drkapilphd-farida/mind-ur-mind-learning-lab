// One of the brief's own 9 named responsibilities, verbatim.
// `'degraded'` still counts for `FallbackProviderResolver` in spirit
// (a last resort) but only `'available'` satisfies
// `DefaultProviderSelectionResolver`'s strict filter — see
// `../resolution/isProviderUsable.ts`.
export type ProviderAvailabilityState = 'available' | 'degraded' | 'unavailable'
