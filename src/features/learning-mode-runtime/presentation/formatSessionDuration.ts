// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved from Quantum Speed Reading™'s own `presentation/formatReadingDuration.ts`
// (Sprint-3) — already fully mode-agnostic. Two real, distinct formats for
// two real, distinct time displays — never one function awkwardly serving
// both. `formatElapsedDuration` is precise (mm:ss, ticking every second —
// the Session Timer). `formatEstimatedTimeRemaining` is deliberately
// imprecise (rounded to the nearest minute) because it IS an estimate —
// LSE-2's own real `estimatedTimeLeftSeconds`, itself a disclosed
// heuristic derived from the ULO's real per-chunk reading-time data —
// formatting it to the second would overstate a precision it never had.
export function formatElapsedDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatEstimatedTimeRemaining(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const totalMinutes = Math.round(safeSeconds / 60)

  if (totalMinutes < 1) return 'Less than a minute left'
  if (totalMinutes < 60) return `~${totalMinutes} min left`

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `~${hours} hr left` : `~${hours} hr ${minutes} min left`
}
