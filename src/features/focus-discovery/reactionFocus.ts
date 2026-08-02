import { FOCUS_COLORS, nextFraction, pickColor, pickShape, type FocusColor, type FocusShape } from './focusObjects'
import {
  REACTION_FOCUS_HARD_MAX_DELAY_MS,
  REACTION_FOCUS_MAX_DECOYS_PER_TRIAL,
  REACTION_FOCUS_MAX_DELAY_MS,
  REACTION_FOCUS_MIN_DELAY_MS,
  REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL,
  REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL,
  REACTION_FOCUS_TRIAL_COUNT,
} from './focusTimingConfig'

export type ReactionFocusTarget = { shape: FocusShape; color: FocusColor }

export type ReactionFocusDecoy = { shape: FocusShape; color: FocusColor; gapBeforeMs: number }

export type ReactionFocusTrial = {
  // A real, independently-randomized chain of zero, one, or two real
  // decoys shown before the real target — "vary the appearance interval
  // ... avoid fixed rhythms" (FIX-04/FIX-09). Each decoy has its own real
  // gap, so the overall rhythm never settles into a learnable pattern.
  decoys: readonly ReactionFocusDecoy[]
  // The real wait after the last real decoy (or immediately, if none)
  // before the real target itself appears.
  delayMs: number
}

// One real, fixed target for the whole mission — "Tap when the Green Dot
// appears. Ignore all other objects" is a single, unchanging rule; only
// the real timing/decoys vary trial to trial.
export function pickReactionFocusTarget(seed: number): ReactionFocusTarget {
  return { shape: pickShape(seed), color: pickColor(seed + 1) }
}

function pickDecoyShapeColor(target: ReactionFocusTarget, seed: number): { shape: FocusShape; color: FocusColor } {
  const shape = pickShape(seed)
  let color = pickColor(seed + 1)
  // A real decoy must genuinely differ from the real target (never an
  // accidental duplicate that would make it a hidden second target).
  if (shape === target.shape && color === target.color) color = FOCUS_COLORS[(FOCUS_COLORS.indexOf(color) + 1) % FOCUS_COLORS.length]!
  return { shape, color }
}

// Sprint-1.7 RULE-01/02 — real "time pressure": the same real delay
// window narrows (never widens) once a real trial reaches the real
// time-pressure threshold — targets genuinely start arriving faster,
// never slower, as the mission progresses.
function randomDelayMs(seed: number, trialIndex: number): number {
  const maxDelay = trialIndex >= REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL ? REACTION_FOCUS_HARD_MAX_DELAY_MS : REACTION_FOCUS_MAX_DELAY_MS
  return Math.round(REACTION_FOCUS_MIN_DELAY_MS + nextFraction(seed) * (maxDelay - REACTION_FOCUS_MIN_DELAY_MS))
}

// Sprint-1.5 FIX-04/FIX-09 — Unpredictability Engine™. A real, variable
// decoy count per trial, each with its own real, independently-
// randomized gap — genuinely irregular, never the fixed "one decoy or
// none" shape Sprint-1 shipped. Sprint-1.7 RULE-01/02 — the real second
// decoy only becomes possible from a real, later trial index on, so the
// earliest trials stay genuinely gentler.
function generateDecoyChain(target: ReactionFocusTarget, trialSeed: number, trialIndex: number): readonly ReactionFocusDecoy[] {
  const maxDecoysThisTrial = trialIndex >= REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL ? REACTION_FOCUS_MAX_DECOYS_PER_TRIAL : Math.min(1, REACTION_FOCUS_MAX_DECOYS_PER_TRIAL)
  const decoyCount = Math.floor(nextFraction(trialSeed + 11) * (maxDecoysThisTrial + 1))
  return Array.from({ length: decoyCount }, (_, decoyIndex) => {
    const decoySeed = trialSeed + decoyIndex * 53 + 17
    const { shape, color } = pickDecoyShapeColor(target, decoySeed)
    return { shape, color, gapBeforeMs: randomDelayMs(decoySeed + 5, trialIndex) }
  })
}

export function generateReactionFocusTrials(target: ReactionFocusTarget, seed: number): readonly ReactionFocusTrial[] {
  return Array.from({ length: REACTION_FOCUS_TRIAL_COUNT }, (_, index) => {
    const trialSeed = seed + index * 97
    return { decoys: generateDecoyChain(target, trialSeed, index), delayMs: randomDelayMs(trialSeed + 1, index) }
  })
}
