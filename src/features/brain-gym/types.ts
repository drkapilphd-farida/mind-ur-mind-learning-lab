export type BrainGymOption = { id: string; label: string }

export type BrainGymRound = {
  // Shown alone during the (brief) stimulus phase, then again as a
  // heading once options appear — the one thing the player is reacting
  // to this round.
  promptLabel: string
  // Positions the stimulus within its container (e.g. 'justify-start'
  // for a left-side flash, 'items-start justify-end' for a top-right
  // quadrant flash) — defaults to dead center when omitted.
  promptContainerClassName?: string
  options: readonly BrainGymOption[]
  correctOptionId: string
}

export type BrainGymDrillConfig = {
  exerciseId: string
  labId: 'quantum-speed-reading'
  title: string
  instructions: string
  roundCount: number
  // How long the stimulus shows before the response options appear (ms).
  // 0 means the stimulus and the options appear together (no separate
  // flash phase) — used when the "stimulus" IS the instruction itself
  // (e.g. Cross-Lateral Tap's "LEFT"/"RIGHT" prompt).
  stimulusDurationMs: number
  // When true, the prompt is hidden once the response phase begins —
  // genuine flash-then-recall (Fast Pattern Blinking™), rather than
  // leaving the answer visible while options are shown (the other 3
  // drills, where seeing the stimulus throughout is part of the task).
  hidePromptDuringResponse?: boolean
  storageKey: string
  completeHeading: string
  completeSubline: string
  buildRound: (roundIndex: number) => BrainGymRound
}
