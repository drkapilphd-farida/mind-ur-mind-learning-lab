// AI Learning Analysis Engine™ (UCE-5). Real — every core concept's
// real position in the real topological `recommendedLearningOrder`,
// re-shaped into a milestone sequence a Learning Mode can render as
// progress checkpoints. `label` reuses the concept's own real display
// label verbatim — never fabricated prose.
export type LearningMilestone = {
  order: number
  conceptNodeId: string
  label: string
}
