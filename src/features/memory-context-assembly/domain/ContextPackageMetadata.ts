// Immutable — every field `readonly`. `sessionId` is `null` when a
// package was assembled without an active session context.
export type ContextPackageMetadata = {
  readonly sessionId: string | null
  readonly generatedAt: string
  readonly version: number
}
