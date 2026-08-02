// Visual Intelligence Lab™ — Visual Fixation Engine™, Sprint 5.
// Per-exercise level/variant ladders — a data file (not hardcoded inline),
// mirroring this lab's established convention (foundationStages.ts,
// imageLibrary.ts, eyeRelaxationSteps.ts). Each level's `difficultyRatio`
// (0-1) is this exercise type's own honest difficulty scale, consumed by
// focusScore.ts's getHighestDifficultyRatio — never a fabricated number,
// just a normalized position on a ladder the student explicitly chose.

import type { FixationExerciseType } from './fixationTypes'

export type FixationLevelOption = {
  value: string
  label: string
  durationSeconds: number
  difficultyRatio: number
}

export const STATIC_DOT_LEVELS: readonly FixationLevelOption[] = [
  { value: '30', label: '30 Seconds', durationSeconds: 30, difficultyRatio: 0.25 },
  { value: '45', label: '45 Seconds', durationSeconds: 45, difficultyRatio: 0.5 },
  { value: '60', label: '60 Seconds', durationSeconds: 60, difficultyRatio: 0.75 },
  { value: '90', label: '90 Seconds', durationSeconds: 90, difficultyRatio: 1 },
] as const

// Brief gives no explicit levels for Breath Sync — same 4 duration options
// as Static Dot Focus, for a consistent picker experience across the engine.
export const BREATH_SYNC_LEVELS: readonly FixationLevelOption[] = STATIC_DOT_LEVELS

// Path variants, not durations — every path runs the same fixed 45s length;
// difficultyRatio is a linear ladder in the order presented (later paths
// ask for more complex pursuit movement).
export const DYNAMIC_DOT_PATHS: readonly FixationLevelOption[] = [
  { value: 'left', label: 'Left', durationSeconds: 45, difficultyRatio: 1 / 6 },
  { value: 'right', label: 'Right', durationSeconds: 45, difficultyRatio: 2 / 6 },
  { value: 'up', label: 'Up', durationSeconds: 45, difficultyRatio: 3 / 6 },
  { value: 'down', label: 'Down', durationSeconds: 45, difficultyRatio: 4 / 6 },
  { value: 'diagonal', label: 'Diagonal', durationSeconds: 45, difficultyRatio: 5 / 6 },
  { value: 'circle', label: 'Circle', durationSeconds: 45, difficultyRatio: 1 },
] as const

// More dots means more rounds to track, so duration scales with count —
// still a fixed, honest per-level design length, never measured.
export const MULTI_DOT_LEVELS: readonly FixationLevelOption[] = [
  { value: '3', label: '3 Dots', durationSeconds: 30, difficultyRatio: 3 / 7 },
  { value: '5', label: '5 Dots', durationSeconds: 45, difficultyRatio: 5 / 7 },
  { value: '7', label: '7 Dots', durationSeconds: 60, difficultyRatio: 1 },
] as const

// Brief gives no explicit levels for Peripheral Activation — a single
// fixed-length mode.
export const PERIPHERAL_LEVELS: readonly FixationLevelOption[] = [
  { value: 'standard', label: 'Standard', durationSeconds: 45, difficultyRatio: 1 },
] as const

export const FIXATION_LEVELS_BY_TYPE: Record<FixationExerciseType, readonly FixationLevelOption[]> = {
  'static-dot': STATIC_DOT_LEVELS,
  'breath-sync': BREATH_SYNC_LEVELS,
  'dynamic-dot': DYNAMIC_DOT_PATHS,
  'multi-dot': MULTI_DOT_LEVELS,
  peripheral: PERIPHERAL_LEVELS,
}

export const FIXATION_EXERCISE_LABEL: Record<FixationExerciseType, string> = {
  'static-dot': 'Static Dot Focus™',
  'breath-sync': 'Breath Sync™',
  'dynamic-dot': 'Dynamic Dot™',
  'multi-dot': 'Multi Dot Attention™',
  peripheral: 'Peripheral Activation™',
}

export const FIXATION_EXERCISE_ROUTE: Record<FixationExerciseType, string> = {
  'static-dot': '/labs/visual-intelligence/fixation/static-dot',
  'breath-sync': '/labs/visual-intelligence/fixation/breath-sync',
  'dynamic-dot': '/labs/visual-intelligence/fixation/dynamic-dot',
  'multi-dot': '/labs/visual-intelligence/fixation/multi-dot',
  peripheral: '/labs/visual-intelligence/fixation/peripheral',
}
