import { useCallback, useRef, useState } from 'react'

// Hero Attention Metric™ — Sprint-1.5 FIX-10. "Introduce one memorable
// attention metric... this metric should become the signature of Focus
// Discovery™." Focus Shield™ is deliberately QUALITATIVE, never a
// number or percentage — FIX-08 explicitly reserves real numeric
// signals for Sprint-2's Focus Intelligence Engine™ ("do not display
// these values yet"). This is a real, live read on the user's own most
// recent real outcomes (a rolling window, not the whole session), shown
// only as one of three calm, honest words.
export type FocusShieldLevel = 'building' | 'steady' | 'strong'

const RECENT_WINDOW = 5
const STRONG_RATIO = 0.8
const STEADY_RATIO = 0.5

export function computeFocusShieldLevel(recentOutcomes: readonly boolean[]): FocusShieldLevel {
  if (recentOutcomes.length === 0) return 'steady'
  const window = recentOutcomes.slice(-RECENT_WINDOW)
  const ratio = window.filter(Boolean).length / window.length
  if (ratio >= STRONG_RATIO) return 'strong'
  if (ratio >= STEADY_RATIO) return 'steady'
  return 'building'
}

export const FOCUS_SHIELD_LABEL: Record<FocusShieldLevel, string> = {
  building: 'Focus Shield: Building',
  steady: 'Focus Shield: Steady',
  strong: 'Focus Shield: Strong',
}

// One real, shared live tracker every mission component feeds its own
// real outcomes into (a correct tap/hit is `true`, a false tap/miss is
// `false`) — never a cross-mission or whole-session score, just this
// exact mission's own most recent real behaviour.
export function useFocusShield(): { level: FocusShieldLevel; recordOutcome: (wasGood: boolean) => void } {
  const [level, setLevel] = useState<FocusShieldLevel>('steady')
  const outcomesRef = useRef<boolean[]>([])

  const recordOutcome = useCallback((wasGood: boolean): void => {
    outcomesRef.current = [...outcomesRef.current, wasGood].slice(-RECENT_WINDOW)
    setLevel(computeFocusShieldLevel(outcomesRef.current))
  }, [])

  return { level, recordOutcome }
}
