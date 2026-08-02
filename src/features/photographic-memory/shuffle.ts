// A genuine Fisher-Yates shuffle and a random-pick helper — shared across
// this feature's 4 category modules (mandala/icon-cluster/flash-matrix/
// color-shape), which are internal submodules of the SAME exercise, not
// separate top-level exercises. This is deliberately different from the
// project's usual "every exercise owns its own copy" convention (RVSE,
// ESP Zener, Quantum Hidden Target Grid, etc. each duplicate this same
// algorithm independently) — that convention is about not coupling
// separate exercises to each other, not about avoiding a shared utility
// within a single exercise's own submodules.
export function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = result[i]
    const atJ = result[j]
    if (atI === undefined || atJ === undefined) continue
    result[i] = atJ
    result[j] = atI
  }
  return result
}

export function pickRandom<T>(values: readonly T[]): T {
  const index = Math.floor(Math.random() * values.length)
  const picked = values[index]
  if (picked === undefined) throw new Error('pickRandom called with an empty array')
  return picked
}
