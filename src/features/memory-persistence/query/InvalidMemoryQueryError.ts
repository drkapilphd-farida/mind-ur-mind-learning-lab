// Thrown by validateMemoryQuery() for a structurally invalid
// MemoryQuery (negative limit/offset, an inverted date range) — a
// real, catchable failure, never a silently-clamped or ignored value.
export class InvalidMemoryQueryError extends Error {
  constructor(reason: string) {
    super(`Invalid memory query: ${reason}`)
    this.name = 'InvalidMemoryQueryError'
  }
}
