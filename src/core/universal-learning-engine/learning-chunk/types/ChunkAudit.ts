// Learning Chunk™ (canonical domain model). Real timestamps set at build
// time — ISO strings, matching this codebase's established convention
// everywhere else (never a Date object, which isn't JSON-safe). `history`
// is real but empty: nothing has revised this chunk since it was created,
// so there is nothing to log yet.
export type ChunkAuditActor = 'system' | 'user'

export type ChunkAuditEntry = {
  changedAt: string
  changedBy: ChunkAuditActor
  changeSummary: string
}

export type ChunkAudit = {
  createdAt: string
  createdBy: ChunkAuditActor
  lastModifiedAt: string
  lastModifiedBy: ChunkAuditActor
  history: readonly ChunkAuditEntry[]
}
