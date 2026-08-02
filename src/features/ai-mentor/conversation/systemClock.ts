import type { Clock } from '../contracts'

// The real default Clock implementation — the only place in this
// feature that calls `new Date()` directly. Every factory that needs a
// timestamp takes a Clock instead, defaulting to this one.
export const systemClock: Clock = {
  now: () => new Date().toISOString(),
}
