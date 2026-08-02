// Injected wherever conversation/ needs "now" — never a direct
// `new Date()` call inside a factory, so tests can supply a fixed
// clock and assert exact timestamps ("Dependency Injection
// everywhere").
export interface Clock {
  now(): string
}
