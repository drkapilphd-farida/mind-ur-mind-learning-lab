// Injected wherever this feature needs "now" — never a direct
// `new Date()` call, so tests can assert exact timestamps.
// Independently declared, not imported from any other feature's own
// identically-shaped Clock (same convention throughout this codebase).
export interface Clock {
  now(): string
}
