// Photographic Reading™ — the spatial layer that makes this exercise
// genuinely different from every other flashing Reading Mode: instead of
// one fixed focus point, each cluster flashes in a different corner (or
// the center) of the stage, forcing the eyes to actually relocate between
// clusters rather than stare at one fixed spot. Deliberately its own tiny
// pure module (own-copy, no React) so it's trivially unit-testable
// independent of the Canvas component that consumes it.
export type SpatialQuadrant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export const SPATIAL_QUADRANTS: readonly SpatialQuadrant[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']

// A degenerate randomFn (e.g. one that always returns the same value) could
// otherwise loop forever trying to avoid a repeat — capped so the function
// always terminates and, in that unavoidable edge case, simply accepts the
// repeat rather than hanging.
const MAX_RETRY_ATTEMPTS = 20

// Assigns one quadrant per unit, guaranteeing no two consecutive units land
// in the same spot (when there's more than one unit to place at all).
// `randomFn` defaults to Math.random but is injectable purely so tests can
// drive it with a deterministic, non-degenerate sequence.
export function assignSpatialQuadrants(unitCount: number, randomFn: () => number = Math.random): SpatialQuadrant[] {
  const assignments: SpatialQuadrant[] = []
  let previous: SpatialQuadrant | null = null

  for (let i = 0; i < unitCount; i++) {
    let candidate = SPATIAL_QUADRANTS[Math.floor(randomFn() * SPATIAL_QUADRANTS.length)] ?? SPATIAL_QUADRANTS[0]!
    let attempts = 0
    while (unitCount > 1 && candidate === previous && attempts < MAX_RETRY_ATTEMPTS) {
      candidate = SPATIAL_QUADRANTS[Math.floor(randomFn() * SPATIAL_QUADRANTS.length)] ?? SPATIAL_QUADRANTS[0]!
      attempts++
    }
    assignments.push(candidate)
    previous = candidate
  }

  return assignments
}
