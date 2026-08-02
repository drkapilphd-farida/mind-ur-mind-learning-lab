// Visual Intelligence Lab™ — Visual Preparation Protocol™, Sprint 4.
// The 8 guided eye-relaxation steps — a data file (not hardcoded inline),
// mirroring this lab's established convention (foundationStages.ts,
// imageLibrary.ts). Each step runs for a real, fixed 12 seconds (within
// the brief's 10-15s range) before auto-advancing.

import { Eye, RotateCw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ZoomIn, ZoomOut, type LucideIcon } from 'lucide-react'

export type EyeMovementDirection = 'none' | 'rotate' | 'left' | 'right' | 'up' | 'down' | 'near' | 'far'

export type EyeRelaxationStep = {
  id: string
  title: string
  instruction: string
  icon: LucideIcon
  direction: EyeMovementDirection
}

export const EYE_RELAXATION_STEP_SECONDS = 12

export const EYE_RELAXATION_STEPS: readonly EyeRelaxationStep[] = [
  { id: 'blink', title: 'Blink Naturally', instruction: 'Let your eyes blink softly and naturally.', icon: Eye, direction: 'none' },
  { id: 'roll', title: 'Roll Eyes Slowly', instruction: 'Slowly roll your eyes in a gentle circle.', icon: RotateCw, direction: 'rotate' },
  { id: 'look-left', title: 'Look Left', instruction: 'Gently move your eyes to the left.', icon: ArrowLeft, direction: 'left' },
  { id: 'look-right', title: 'Look Right', instruction: 'Gently move your eyes to the right.', icon: ArrowRight, direction: 'right' },
  { id: 'look-up', title: 'Look Up', instruction: 'Gently move your eyes upward.', icon: ArrowUp, direction: 'up' },
  { id: 'look-down', title: 'Look Down', instruction: 'Gently move your eyes downward.', icon: ArrowDown, direction: 'down' },
  { id: 'near-focus', title: 'Near Focus', instruction: 'Focus on something close to you.', icon: ZoomIn, direction: 'near' },
  { id: 'far-focus', title: 'Far Focus', instruction: 'Focus on something far in the distance.', icon: ZoomOut, direction: 'far' },
] as const
