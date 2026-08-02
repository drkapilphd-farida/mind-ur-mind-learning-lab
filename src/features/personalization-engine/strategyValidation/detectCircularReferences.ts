import type { PersonalizationStrategy, StrategyId } from '../strategyDomain'

// Pure — DFS cycle detection over the `dependsOnStrategyIds` graph,
// tracking the current recursion path so that when a back-edge is
// found, *every* node on the cycle (not just the two ends of the
// back-edge) is reported — a 3+ node cycle (A -> B -> C -> A) must
// mark A, B, *and* C, not only A and C. Missing-dependency ids are
// silently skipped here — that's `validateStrategySet`'s own separate
// "missing-dependency" check's job, not this function's.
export function detectCircularReferences(strategies: readonly PersonalizationStrategy[]): readonly StrategyId[] {
  const byId = new Map(strategies.map((strategy) => [strategy.id, strategy]))
  const state = new Map<StrategyId, 'visiting' | 'done'>()
  const cyclic = new Set<StrategyId>()
  const path: StrategyId[] = []

  function visit(id: StrategyId): void {
    const current = state.get(id)
    if (current === 'done') return

    if (current === 'visiting') {
      const startIndex = path.indexOf(id)
      for (let index = startIndex; index < path.length; index += 1) {
        cyclic.add(path[index]!)
      }
      return
    }

    state.set(id, 'visiting')
    path.push(id)

    // `visit()` is only ever called with an id already known to exist
    // in `byId` — either from the top-level loop (built from the same
    // array) or a `dependencyId` already confirmed via `byId.has()` —
    // so this lookup can never miss.
    const strategy = byId.get(id)!
    for (const dependencyId of strategy.dependsOnStrategyIds) {
      if (byId.has(dependencyId)) visit(dependencyId)
    }

    path.pop()
    state.set(id, 'done')
  }

  for (const strategy of strategies) {
    visit(strategy.id)
  }

  return [...cyclic]
}
