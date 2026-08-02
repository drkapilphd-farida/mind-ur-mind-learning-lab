export type ComboState = {
  combo: number
  lastItemAt: number | null
}

export const INITIAL_COMBO_STATE: ComboState = { combo: 0, lastItemAt: null }

// A real, disclosed threshold — engagement reads as "broken" once more
// than 8 real seconds pass between one item finishing and the next
// starting (a genuine pause, not the normal, fast per-item cadence this
// runtime otherwise has).
const COMBO_RESET_GAP_MS = 8000

// Reading Runtime Engine™ (Sprint-2 Part-2) — Combo, reframed as a real
// engagement streak, never a correctness streak. This entire Discovery
// arc has never tracked or displayed correctness anywhere ("never show
// Wrong/Failed/Poor... observation only, not scored"); the one real
// "Combo x4" precedent elsewhere in this codebase
// (`computeCombo`/`comboMicroFeedback` in the AIEE exercise-engine) is
// explicitly correct/incorrect-based, and reusing that formula here
// would silently introduce scoring into a system built specifically not
// to have it. This version only ever resets on a real long idle gap —
// never on a "wrong" answer, since nothing here is ever wrong.
export function computeNextComboState(previous: ComboState, now: number): ComboState {
  if (previous.lastItemAt !== null && now - previous.lastItemAt > COMBO_RESET_GAP_MS) {
    return { combo: 1, lastItemAt: now }
  }
  return { combo: previous.combo + 1, lastItemAt: now }
}
