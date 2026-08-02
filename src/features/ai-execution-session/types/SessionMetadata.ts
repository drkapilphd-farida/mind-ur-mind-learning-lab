// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — same `learnerId`/`profileId`/`source`/timestamp
// convention as every prior engine's metadata type this session.
export type SessionMetadata = {
  readonly sessionId: string
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly createdAt: string
}
