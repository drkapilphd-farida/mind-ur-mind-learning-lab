import type { ConceptSequence, LearningJourney, LearningJourneyStep, LearningObjectType, StudyModesDataset } from '../types'

// Fixed pedagogical order (learn → reinforce → apply → revisit → test)
// for whichever study modes StudyModesDataset actually reports
// available. 'summary'/'mind-map-node'/'teaching-outline' are
// deliberately absent from this list — with no generator producing
// them yet, they'd never appear regardless, but leaving them out here
// keeps this list's intent explicit rather than relying on
// isAvailable filtering alone to hide them.
const STEP_ORDER: readonly { objectType: LearningObjectType; title: string; description: string }[] = [
  { objectType: 'concept', title: 'Review Key Concepts', description: 'Work through the concepts identified in this document, in recommended order.' },
  { objectType: 'flashcard', title: 'Flashcards', description: 'Reinforce terms and ideas with spaced repetition.' },
  { objectType: 'practice-question', title: 'Practice', description: "Apply what you've learned with guided questions." },
  { objectType: 'revision-block', title: 'Revision', description: 'Revisit key ideas to build lasting memory.' },
  { objectType: 'quiz-question', title: 'Quiz', description: 'Test your understanding with adaptive questions.' },
]

// Another "second-order" generator — depends on generateConceptSequence's
// and generateStudyModesDataset's output, not the raw ConceptGraph.
// The journey's length and content genuinely reflect what this
// LearningPlan has ready: an orientation step always leads (there's
// always a concept sequence once any concepts exist), followed by one
// step per available study mode, in STEP_ORDER's fixed order — never a
// hardcoded step count.
export function generateLearningJourney(conceptSequence: ConceptSequence, studyModes: StudyModesDataset): LearningJourney {
  const availableTypes = new Set(studyModes.filter((mode) => mode.isAvailable).map((mode) => mode.objectType))

  const steps: LearningJourneyStep[] = []

  if (conceptSequence.orderedConceptIds.length > 0) {
    steps.push({
      id: 'journey-overview',
      objectType: null,
      title: 'Overview',
      description: `Get the big picture across ${conceptSequence.orderedConceptIds.length} concept${conceptSequence.orderedConceptIds.length === 1 ? '' : 's'} before going deep into any one part.`,
    })
  }

  for (const step of STEP_ORDER) {
    if (!availableTypes.has(step.objectType)) continue
    steps.push({ id: `journey-${step.objectType}`, objectType: step.objectType, title: step.title, description: step.description })
  }

  return { documentId: conceptSequence.documentId, steps }
}
