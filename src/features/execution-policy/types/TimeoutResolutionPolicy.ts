// Renamed from the brief's own "TimeoutPolicy" for family consistency
// with `RetryEligibilityPolicy` (no direct collision itself, but part
// of the same tightly-bundled sibling family) — echoes the brief's own
// "timeout resolution" language.
export type TimeoutResolutionPolicy = {
  readonly deadlineMs: number
}
