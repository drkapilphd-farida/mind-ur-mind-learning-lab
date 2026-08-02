// Universal Learning Object™ (UCE-6). Real timestamps — ISO strings,
// identical pattern to `ChunkAudit`. `history` is real but starts empty;
// `updateUniversalLearningObject()` appends one real entry per update —
// the real audit trail the brief's "IMMUTABILITY... Support: Version
// history, Audit trail" asks for.
export type ULOAuditActor = 'system' | 'user'

export type ULOAuditEntry = {
  changedAt: string
  changedBy: ULOAuditActor
  changeSummary: string
}

export type ULOAudit = {
  createdAt: string
  createdBy: ULOAuditActor
  lastModifiedAt: string
  lastModifiedBy: ULOAuditActor
  history: readonly ULOAuditEntry[]
}
