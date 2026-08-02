import type { CostTracker, CostTrackingEntry } from '../types/CostTracker'

// AI Foundation Layer™ — AIF-1. Real, in-process, append-only log — the
// default CostTracker implementation. Scoped limitation, disclosed in
// the architecture doc: resets on process restart, not shared across
// server instances. The interface is the seam a future persistent
// (Supabase-table-backed) implementation plugs into without changing
// aiFoundation.ts.
export class InMemoryCostTracker implements CostTracker {
  private readonly entries: CostTrackingEntry[] = []

  record(entry: CostTrackingEntry): void {
    this.entries.push(entry)
  }

  list(): readonly CostTrackingEntry[] {
    return [...this.entries]
  }

  totalCostCents(filter: { providerId?: string } = {}): number {
    return this.entries
      .filter((entry) => filter.providerId === undefined || entry.providerId === filter.providerId)
      .reduce((sum, entry) => sum + entry.actualCost.totalCostCents, 0)
  }
}

export function createInMemoryCostTracker(): CostTracker {
  return new InMemoryCostTracker()
}
