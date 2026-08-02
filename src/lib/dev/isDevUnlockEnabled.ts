// Dev/Test Mode™ — a single global bypass for every sequential
// exercise/stage/journey lock in the platform, generalizing the pattern
// already proven in src/features/tratak-intelligence/tratakDevUnlock.ts
// (scoped there to just the Tratak foundation/level locks) to every other
// gated flow: the Reading Hub's 3 gated exercise sequences
// (getModuleProgress/deriveAvailability), the Brain Evolution stage
// timeline (computeJourneyProgress), the hardcoded cross-stage checks in
// preparation/page.tsx and phrase-reading/page.tsx, and the 21-Day
// Transformation Journey's Pro gate.
//
// A plain runtime boolean — safe to ship in the production bundle as-is,
// since it only ever evaluates true in a genuine dev/staging environment
// that deliberately opts in via NEXT_PUBLIC_DEV_UNLOCK, or automatically
// in local development. Per user decision, this stays a dev/test-only
// bypass — regular production users keep every existing gate exactly as
// it is today.
export function isDevUnlockEnabled(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_UNLOCK === 'true'
}
