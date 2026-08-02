// Immutable — every field `readonly`. Same `userId`/`source` naming
// convention already established in `query/MemoryQuery.ts` and
// `indexDomain` (userId maps to `Memory.metadata.learnerId`).
export type TransactionMetadata = {
  readonly userId: string
  readonly source: string
}
