// Thrown by DefaultContextOrchestrationService.restoreFromSnapshot()
// when validateSnapshotIntegrity() fails — a real, catchable failure,
// never a silent no-op restore.
export class InvalidContextSnapshotError extends Error {
  constructor(reason: string) {
    super(`Invalid context snapshot: ${reason}`)
    this.name = 'InvalidContextSnapshotError'
  }
}
