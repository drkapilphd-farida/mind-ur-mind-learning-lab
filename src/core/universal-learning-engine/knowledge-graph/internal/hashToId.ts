import { createHash } from 'node:crypto'

// Learning Knowledge Graph™ (UCE-4). The one shared, deterministic
// id-generation primitive — used by buildConceptIndex.ts (concept node
// ids) and computeEdgeId.ts (edge ids). Deterministic on purpose:
// "Stable IDs. Immutable node identity." — the same input always
// produces the same id, on every rebuild, across processes. Server-only
// (node:crypto) — this whole module must never be imported into a
// client component, matching the rest of this codebase's AI/server-only
// boundaries.
export function hashToId(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 32)
}
