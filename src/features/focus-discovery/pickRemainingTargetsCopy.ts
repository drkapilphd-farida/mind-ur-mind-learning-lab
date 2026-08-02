// AI Interaction Awareness™ — Sprint-1.6 FIX-12. "AI encouragement
// should react naturally... Keep going. Almost there. Final target. Use
// only one short sentence. Never interrupt gameplay." A real, honest
// read on the real remaining-targets count this exact round has left —
// never a fixed line, never shown as a popup (rendered inline, next to
// `RemainingTargetsIndicator`).
const ALMOST_THERE_FRACTION = 0.25

export function pickRemainingTargetsCopy(remaining: number, total: number): string | null {
  if (total <= 0 || remaining >= total) return null
  if (remaining <= 0) return null
  if (remaining === 1) return 'Final target.'
  if (remaining <= Math.max(2, Math.ceil(total * ALMOST_THERE_FRACTION))) return 'Almost there.'
  return 'Keep going.'
}
