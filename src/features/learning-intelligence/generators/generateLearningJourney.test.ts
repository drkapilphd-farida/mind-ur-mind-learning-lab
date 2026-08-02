import { describe, expect, it } from 'vitest'
import { generateLearningJourney } from './generateLearningJourney'
import type { ConceptSequence, StudyModesDataset } from '../types'

const FULL_STUDY_MODES: StudyModesDataset = [
  { objectType: 'concept', isAvailable: true, itemCount: 3 },
  { objectType: 'flashcard', isAvailable: true, itemCount: 3 },
  { objectType: 'quiz-question', isAvailable: true, itemCount: 3 },
  { objectType: 'practice-question', isAvailable: true, itemCount: 3 },
  { objectType: 'revision-block', isAvailable: true, itemCount: 3 },
  { objectType: 'summary', isAvailable: false, itemCount: 0 },
  { objectType: 'mind-map-node', isAvailable: false, itemCount: 0 },
  { objectType: 'teaching-outline', isAvailable: false, itemCount: 0 },
]

const SEQUENCE: ConceptSequence = { documentId: 'doc-1', orderedConceptIds: ['concept-0', 'concept-1', 'concept-2'] }

describe('generateLearningJourney', () => {
  it('leads with an Overview step when concepts exist', () => {
    const journey = generateLearningJourney(SEQUENCE, FULL_STUDY_MODES)
    expect(journey.steps[0]).toMatchObject({ objectType: null, title: 'Overview' })
  })

  it('includes one step per available study mode, in pedagogical order', () => {
    const journey = generateLearningJourney(SEQUENCE, FULL_STUDY_MODES)
    expect(journey.steps.map((step) => step.objectType)).toEqual([null, 'concept', 'flashcard', 'practice-question', 'revision-block', 'quiz-question'])
  })

  it('omits a step for every unavailable study mode', () => {
    const partialStudyModes: StudyModesDataset = FULL_STUDY_MODES.map((mode) =>
      mode.objectType === 'quiz-question' ? { ...mode, isAvailable: false, itemCount: 0 } : mode,
    )
    const journey = generateLearningJourney(SEQUENCE, partialStudyModes)
    expect(journey.steps.some((step) => step.objectType === 'quiz-question')).toBe(false)
  })

  it('omits the Overview step for an empty concept sequence', () => {
    const journey = generateLearningJourney({ documentId: 'doc-1', orderedConceptIds: [] }, FULL_STUDY_MODES)
    expect(journey.steps.find((step) => step.title === 'Overview')).toBeUndefined()
  })

  it('scopes the journey to the concept sequence’s documentId', () => {
    const journey = generateLearningJourney(SEQUENCE, FULL_STUDY_MODES)
    expect(journey.documentId).toBe('doc-1')
  })
})
