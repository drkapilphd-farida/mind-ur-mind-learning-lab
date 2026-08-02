// Right-Brain Visual Activation — Level 2 of the Daily Quantum Session.
// A flash-then-recognize icon drill with a user-selectable flash speed
// (visual span training gets harder as the flash gets shorter), own-copy
// convention consistent with every other phase in this flow.

export type FlashSpeedMs = 400 | 350 | 300

export type FlashSpeedOption = { ms: FlashSpeedMs; label: string; hint: string }

export const FLASH_SPEED_OPTIONS: readonly FlashSpeedOption[] = [
  { ms: 400, label: 'Relaxed', hint: '400ms' },
  { ms: 350, label: 'Standard', hint: '350ms' },
  { ms: 300, label: 'Quantum', hint: '300ms' },
]

export const DEFAULT_FLASH_SPEED_MS: FlashSpeedMs = 350
export const ITEMS_PER_ROUND = 10

export type IconDef = { name: string; label: string }

export const ICON_POOL: readonly IconDef[] = [
  { name: 'Star', label: 'Star' },
  { name: 'Heart', label: 'Heart' },
  { name: 'Cloud', label: 'Cloud' },
  { name: 'Sun', label: 'Sun' },
  { name: 'Moon', label: 'Moon' },
  { name: 'Leaf', label: 'Leaf' },
  { name: 'Snowflake', label: 'Snowflake' },
  { name: 'Flame', label: 'Flame' },
  { name: 'Zap', label: 'Zap' },
  { name: 'Anchor', label: 'Anchor' },
  { name: 'Gem', label: 'Gem' },
  { name: 'Compass', label: 'Compass' },
]

export type VisualActivationRound = {
  targetName: string
  targetLabel: string
  options: readonly [string, string, string, string]
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as T
    copy[j] = temp as T
  }
  return copy
}

export function buildRounds(count: number): readonly VisualActivationRound[] {
  const shuffledPool = shuffle(ICON_POOL)
  const picks = shuffledPool.slice(0, count)
  return picks.map((target) => {
    const distractorPool = shuffledPool.filter((icon) => icon.name !== target.name)
    const distractors = shuffle(distractorPool).slice(0, 3)
    const options = shuffle([target, ...distractors]).map((icon) => icon.label)
    return {
      targetName: target.name,
      targetLabel: target.label,
      options: options as [string, string, string, string],
    }
  })
}

export function computeVisualActivationAccuracy(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((correctCount / totalCount) * 100)
}

// A 0-100 score purely from which flash speed the user chose — never
// from WPM (this level is a visual-span drill, not a reading-speed
// one). Relaxed (400ms, the slowest/easiest) scores 0; Quantum (300ms,
// the fastest/hardest) scores 100 — a genuine measure of how much
// difficulty they opted into, not a fabricated number.
export function computeVisualActivationSpeedScore(speedMs: FlashSpeedMs): number {
  const slowestMs = 400
  const fastestMs = 300
  return Math.round(((slowestMs - speedMs) / (slowestMs - fastestMs)) * 100)
}

// Rewards both real signals this level actually measures — recognition
// accuracy and the difficulty of the chosen speed — weighted toward
// accuracy since a wrong answer at Quantum speed still means the icon
// wasn't recognized. Never a flat number regardless of performance,
// matching how every reward in this flow reflects something real the
// user did.
export function computeVisualActivationXp(accuracyPercent: number, speedScore: number): number {
  const blended = accuracyPercent * 0.7 + speedScore * 0.3
  return 50 + Math.round(blended * 0.5)
}
