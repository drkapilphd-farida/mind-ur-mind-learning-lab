import { createReadingIntelligenceExperience, type ReadingIntelligenceExperience } from '@/features/reading-intelligence'
import type { ModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'
import { buildReadingExerciseQueue } from '../queue'
import { buildReadingIntelligenceJourney } from '../journey'
import type { ReadingIntelligenceJourney } from '../types'
import type { ReadingIntelligenceJourneyOrchestrator } from './ReadingIntelligenceJourneyOrchestrator'

// No exercises of a stage with no ModuleProgress entry of its own (the
// terminal "Reading Intelligence™" stage — see journeyProgress.ts's own
// comment: "null for a stage with no exercises of its own").
const EMPTY_MODULE_PROGRESS: ModuleProgress = {
  statusByExerciseId: {},
  availabilityByExerciseId: {},
  nextRecommendedExerciseId: null,
  resumeExerciseId: null,
  lastCompletedExerciseId: null,
  completedCount: 0,
  totalCount: 0,
}

export type ReadingIntelligenceJourneyOrchestratorDependencies = {
  experience: ReadingIntelligenceExperience
}

function createDefaultDependencies(): ReadingIntelligenceJourneyOrchestratorDependencies {
  return { experience: createReadingIntelligenceExperience() }
}

// The ONLY file in this feature that imports a real, non-type value from
// another src/features/* folder — createReadingIntelligenceExperience
// (Sprint 46, unmodified). Mirrors Sprint 46's own "one confined seam"
// discipline exactly.
export class DefaultReadingIntelligenceJourneyOrchestrator implements ReadingIntelligenceJourneyOrchestrator {
  constructor(private readonly dependencies: ReadingIntelligenceJourneyOrchestratorDependencies) {}

  async load(currentStageSequence: readonly ExerciseSequenceItem[]): Promise<ReadingIntelligenceJourney> {
    const experienceResult = await this.dependencies.experience.load()

    const currentStageEntry = experienceResult.progressSnapshot.stages.find(
      (stage) => stage.stageId === experienceResult.dailyMission.stageId,
    )
    const moduleProgress = currentStageEntry?.progress ?? EMPTY_MODULE_PROGRESS

    const queue = buildReadingExerciseQueue(currentStageSequence, moduleProgress)
    return buildReadingIntelligenceJourney(experienceResult, queue)
  }
}

export function createReadingIntelligenceJourneyOrchestrator(
  overrides: Partial<ReadingIntelligenceJourneyOrchestratorDependencies> = {},
): ReadingIntelligenceJourneyOrchestrator {
  return new DefaultReadingIntelligenceJourneyOrchestrator({ ...createDefaultDependencies(), ...overrides })
}
