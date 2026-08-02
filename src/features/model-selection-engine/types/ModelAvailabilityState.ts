// One of the brief's own 10 named responsibilities, verbatim.
// `'degraded'` is excluded by both `DefaultModelResolver` and
// `FallbackModelResolver` — see `../resolution/isModelUsable.ts`.
export type ModelAvailabilityState = 'available' | 'degraded' | 'unavailable'
