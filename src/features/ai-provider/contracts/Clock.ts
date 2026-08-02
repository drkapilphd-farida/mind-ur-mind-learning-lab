// Injected wherever this feature needs "now" — never a direct
// `new Date()` call inside an adapter, so tests can assert exact
// timestamps. A small, self-contained interface, not imported from
// `@/features/ai-mentor/contracts`'s own identically-shaped Clock —
// this feature must stay fully independent of ai-mentor (see
// types/index.ts's own header comment).
export interface Clock {
  now(): string
}
