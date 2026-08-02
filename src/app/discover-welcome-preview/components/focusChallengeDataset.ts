// Focus Challenge™ — timing, scoring, and results logic for the
// 2-minute assessment lead magnet's final phase. Self-contained (no
// imports from Reading Sprint's or Memory Challenge's datasets) — this
// project's own established convention is that each area keeps its own
// copy of shared-shaped logic (scoring formulas, shuffle helpers)
// rather than importing across unrelated feature areas.
//
// The mechanic is a classic go/no-go attention task: exactly one cell
// in a 3×3 grid is ever "live" at a time, showing either a genuine
// target (click it) or a decoy (don't) for a fixed, fair window before
// it disappears. Only one stimulus at a time keeps the state machine
// simple and bug-resistant while still fully testing both reaction
// speed (targets) and distraction filtering (decoys) — nothing here is
// fabricated: every stat in the results screen is a real tally of real
// clicks and real timeouts.

export const GRID_SIZE = 9

export const SESSION_DURATION_MS = 45_000

// How long a spawned stimulus stays live and clickable before it
// disappears un-clicked (a miss for a target, a successful filter for a
// decoy).
export const STIMULUS_ACTIVE_DURATION_MS = 850

// The pause between one stimulus disappearing and the next appearing —
// randomized within this range so spawns never feel metronomic.
export const GAP_DURATION_RANGE_MS: readonly [number, number] = [300, 650]

// 70% targets, 30% decoys — targets dominant enough that there's always
// plenty to react to, decoys frequent enough to genuinely test filtering.
export const TARGET_PROBABILITY = 0.7

export const COUNTDOWN_STATES: readonly string[] = ['3', '2', '1', 'GO!']
export const COUNTDOWN_TOTAL_MS = 3_000
export const COUNTDOWN_STEP_MS = COUNTDOWN_TOTAL_MS / COUNTDOWN_STATES.length

export function pickRandomGapDurationMs(): number {
  const [min, max] = GAP_DURATION_RANGE_MS
  return Math.round(min + Math.random() * (max - min))
}

export function pickRandomCellIndex(): number {
  return Math.floor(Math.random() * GRID_SIZE)
}

export function pickStimulusKind(): 'target' | 'decoy' {
  return Math.random() < TARGET_PROBABILITY ? 'target' : 'decoy'
}

// --- Scoring ------------------------------------------------------------
const STREAK_MULTIPLIER_STEP = 3
export const BASE_POINTS_PER_TARGET_HIT = 100
export const DECOY_IGNORE_POINTS = 40
export const TIMING_BONUS_WINDOW_MS = 350
export const TIMING_BONUS_POINTS = 30

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForTargetHit(streakAfterThisHit: number, reactionTimeMs: number): number {
  const base = BASE_POINTS_PER_TARGET_HIT * computeStreakMultiplier(streakAfterThisHit)
  const timingBonus = reactionTimeMs <= TIMING_BONUS_WINDOW_MS ? TIMING_BONUS_POINTS : 0
  return base + timingBonus
}

// --- Results --------------------------------------------------------------
export type AttentionLabel = 'Laser Focus' | 'Strong Attention Control' | 'Developing Focus' | 'Building Attention Stamina'

// Equally weighted across the two things this drill actually measures —
// reacting to real targets and correctly filtering out decoys — so a
// learner can't post a high score just by clicking everything, or just
// by clicking nothing.
export function computeAttentionStabilityPercent(targetsHit: number, totalTargetsShown: number, decoysIgnored: number, totalDecoysShown: number): number {
  const targetHitRate = totalTargetsShown > 0 ? targetsHit / totalTargetsShown : 0
  const decoyFilterRate = totalDecoysShown > 0 ? decoysIgnored / totalDecoysShown : 0
  return Math.round(((targetHitRate + decoyFilterRate) / 2) * 100)
}

export function getAttentionLabel(attentionStabilityPercent: number): AttentionLabel {
  if (attentionStabilityPercent >= 90) return 'Laser Focus'
  if (attentionStabilityPercent >= 75) return 'Strong Attention Control'
  if (attentionStabilityPercent >= 50) return 'Developing Focus'
  return 'Building Attention Stamina'
}
