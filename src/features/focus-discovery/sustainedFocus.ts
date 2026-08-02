import { FOCUS_COLORS, FOCUS_SHAPES, nextFraction, pickColor, pickShape, type FocusColor, type FocusObject, type FocusShape } from './focusObjects'
import {
  SUSTAINED_FOCUS_BLINKING_FROM_STAGE,
  SUSTAINED_FOCUS_COLOR_VARIATION_FROM_STAGE,
  SUSTAINED_FOCUS_DENSITY_STAGE_3,
  SUSTAINED_FOCUS_HIGH_CLUTTER_FROM_STAGE,
  SUSTAINED_FOCUS_HIGH_CLUTTER_PROBABILITY,
  SUSTAINED_FOCUS_MAX_DURATION_MS,
  SUSTAINED_FOCUS_MAX_TICK_MS,
  SUSTAINED_FOCUS_MIN_DURATION_MS,
  SUSTAINED_FOCUS_MIN_TICK_MS,
  SUSTAINED_FOCUS_MOVEMENT_FROM_STAGE,
  SUSTAINED_FOCUS_STAGE_COUNT,
} from './focusTimingConfig'

// Real chance any given tick's own stimulus is actually the real target
// — a real Go/No-Go rhythm (most ticks are distractors to ignore, a
// genuine minority are the real target to tap).
const TARGET_TICK_PROBABILITY = 0.35
// Each real density stage (0, 1, 2) shaves this fraction off the real
// tick-gap range's ceiling — "10 → 15 → 20 objects" translated honestly
// for a continuous, tick-based paradigm: more frequent real appearances,
// not a static grid count.
const DENSITY_SPEEDUP_PER_STAGE = 0.15

export type SustainedFocusTick = {
  object: FocusObject
  isTarget: boolean
  // A second, real, SIMULTANEOUS object — always a non-target distractor
  // — only ever present once the real session reaches its own real
  // "high clutter" stage (FIX-05: "visual clutter... high distraction").
  clutterObject?: FocusObject
  // FIX-01/FIX-05 — real cumulative distraction dimensions, each
  // introduced at its own real stage and never removed afterward.
  isMoving: boolean
  isBlinking: boolean
  // A real second colour this same tick's object shifts to partway
  // through its own display window — real "colour changes," never a
  // different shape (the rule stays shape-based throughout).
  midTickColor?: FocusColor | undefined
}

// "The primary task remains unchanged" — one real target shape, picked
// once per real session, held fixed for the whole real ~30-45s mission.
export function pickSustainedFocusTargetShape(seed: number): FocusShape {
  return pickShape(seed)
}

export function pickSustainedFocusDurationMs(seed: number): number {
  return Math.round(SUSTAINED_FOCUS_MIN_DURATION_MS + nextFraction(seed) * (SUSTAINED_FOCUS_MAX_DURATION_MS - SUSTAINED_FOCUS_MIN_DURATION_MS))
}

// Sprint-1.5 FIX-05/FIX-07 — the real session splits into
// `SUSTAINED_FOCUS_STAGE_COUNT` equal real stages; each later stage
// keeps every earlier real dimension active and adds exactly one more —
// a real, cumulative ramp, never several new dimensions at once.
export function sustainedFocusStageFor(elapsedFraction: number): number {
  return Math.min(SUSTAINED_FOCUS_STAGE_COUNT - 1, Math.floor(elapsedFraction * SUSTAINED_FOCUS_STAGE_COUNT))
}

export function nextSustainedFocusTickDelayMs(seed: number, tickIndex: number, elapsedFraction: number): number {
  const stage = sustainedFocusStageFor(elapsedFraction)
  const densityStage = Math.min(stage, SUSTAINED_FOCUS_DENSITY_STAGE_3)
  const speedFactor = 1 - densityStage * DENSITY_SPEEDUP_PER_STAGE
  const fraction = nextFraction(seed + tickIndex * 53)
  return Math.round(SUSTAINED_FOCUS_MIN_TICK_MS + fraction * (SUSTAINED_FOCUS_MAX_TICK_MS - SUSTAINED_FOCUS_MIN_TICK_MS) * speedFactor)
}

function pickNonTargetShape(targetShape: FocusShape, seed: number): FocusShape {
  const others = FOCUS_SHAPES.filter((shape) => shape !== targetShape)
  return others[Math.floor(nextFraction(seed) * others.length)]!
}

function pickDifferentColor(current: FocusColor, seed: number): FocusColor {
  const candidate = pickColor(seed)
  return candidate === current ? FOCUS_COLORS[(FOCUS_COLORS.indexOf(candidate) + 1) % FOCUS_COLORS.length]! : candidate
}

function randomPosition(seed: number): { xPercent: number; yPercent: number } {
  return { xPercent: 30 + nextFraction(seed) * 40, yPercent: 30 + nextFraction(seed + 1) * 40 }
}

function buildObject(id: string, shape: FocusShape, color: FocusColor, seed: number): FocusObject {
  return { id, shape, color, ...randomPosition(seed) }
}

// One real tick's content — `elapsedFraction` (0 to 1, how far through
// the real session duration this tick falls) resolves the real stage
// that gates every distraction dimension below, so they genuinely ramp
// over time rather than being flat throughout.
export function generateSustainedFocusTick(targetShape: FocusShape, tickIndex: number, elapsedFraction: number, seed: number): SustainedFocusTick {
  const stage = sustainedFocusStageFor(elapsedFraction)
  const tickSeed = seed + tickIndex * 97
  const isTarget = nextFraction(tickSeed + 1) < TARGET_TICK_PROBABILITY
  const shape = isTarget ? targetShape : pickNonTargetShape(targetShape, tickSeed + 2)
  const color = pickColor(tickSeed + 3)
  const object = buildObject(`sustained-tick-${tickIndex}`, shape, color, tickSeed + 4)

  const isMoving = stage >= SUSTAINED_FOCUS_MOVEMENT_FROM_STAGE
  const isBlinking = stage >= SUSTAINED_FOCUS_BLINKING_FROM_STAGE
  const midTickColor = stage >= SUSTAINED_FOCUS_COLOR_VARIATION_FROM_STAGE ? pickDifferentColor(color, tickSeed + 20) : undefined

  const wantsClutter = stage >= SUSTAINED_FOCUS_HIGH_CLUTTER_FROM_STAGE && nextFraction(tickSeed + 6) < SUSTAINED_FOCUS_HIGH_CLUTTER_PROBABILITY
  if (!wantsClutter) return { object, isTarget, isMoving, isBlinking, midTickColor }

  const clutterShape = pickNonTargetShape(targetShape, tickSeed + 7)
  const clutterColor = pickColor(tickSeed + 8)
  const clutterObject = buildObject(`sustained-tick-${tickIndex}-clutter`, clutterShape, clutterColor, tickSeed + 9)
  return { object, isTarget, clutterObject, isMoving, isBlinking, midTickColor }
}
