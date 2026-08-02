import type { LearningObjectType } from './learningObject'

// The engine's own Learning Journey artifact — deliberately not an
// alias for Sprint 1/2's `BlueprintJourneyStep`
// (`@/types/learning/blueprint`), for the same reason LearningPlan
// isn't an alias for LearningBlueprint (see learningPlan.ts). Built
// dynamically from whichever study modes a LearningPlan actually has
// content for (StudyModesDataset), so its length reflects real
// availability rather than a fixed step count.
export type LearningJourneyStep = {
  id: string
  // null for a structural step (e.g. an orientation step with no
  // single concept behind it); set once a step corresponds to working
  // through one specific object type's content.
  objectType: LearningObjectType | null
  title: string
  description: string
}

export type LearningJourney = {
  documentId: string
  steps: readonly LearningJourneyStep[]
}
