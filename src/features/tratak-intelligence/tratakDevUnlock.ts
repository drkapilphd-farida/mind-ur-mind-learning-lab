// Visual Intelligence Lab™ — Tratak Intelligence Journey™, dev-only unlock mode.
// A plain runtime boolean — safe to ship in the production bundle as-is,
// since it only ever evaluates true in a genuine dev/staging environment
// that deliberately opts in. This is not the same category of concern as
// the Dev Panel's UI (which must be literally absent from production
// builds) — this function only ever gates a boolean decision, never
// whether code exists in the bundle. isFoundationJourneyComplete and the
// per-level sequential unlock logic are never modified; this is purely an
// additional OR-bypass at the point each gate is evaluated.
export function isTratakDevUnlockEnabled(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_UNLOCK === 'true'
}
