import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'

export const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

// A hand-built, minimal-but-realistic `ChapterIntelligenceBlueprint` —
// every builder in this module operates purely on this real shape, so
// unit tests construct it directly rather than running the full
// knowledge-graph/learning-analysis pipeline (which would require
// mocking an AI call just to exercise the one AI-derived `'builds-upon'`
// edge type this module's prerequisite/dependent split relies on).
export function makeBlueprint(overrides: Partial<ChapterIntelligenceBlueprint> = {}): ChapterIntelligenceBlueprint {
  return {
    header: {
      blueprintId: 'blueprint-1',
      documentId: 'doc-1',
      chapterId: 'chunk-1',
      title: 'Photosynthesis and Respiration',
      language: null,
      chapterNumber: 1,
      subject: 'Biology 101',
      estimatedReadingTime: 30,
      estimatedLearningTime: 45,
      difficulty: 'beginner',
      version: 1,
    },
    chapterIntelligence: {
      summary: 'Covers photosynthesis and cellular respiration.',
      learningObjectives: ['Explain photosynthesis.'],
      coreConcepts: ['photosynthesis', 'cellular respiration'],
      prerequisiteConcepts: [],
      readingDifficulty: 10,
      recommendedLearningOrder: ['photosynthesis', 'cellular respiration'],
    },
    learningObjects: {
      objects: [
        {
          objectId: 'obj-photosynthesis',
          title: 'Photosynthesis',
          type: 'concept',
          importance: 0.9,
          difficulty: 'beginner',
          explanation: null,
          definition: 'The process of converting light into chemical energy.',
          examples: ['plants making glucose from sunlight'],
          misconceptions: ['Photosynthesis only happens at night.'],
          relatedObjects: ['obj-respiration'],
        },
        {
          objectId: 'obj-respiration',
          title: 'Cellular Respiration',
          type: 'concept',
          importance: 0.7,
          difficulty: 'intermediate',
          explanation: null,
          definition: null,
          examples: [],
          misconceptions: [],
          relatedObjects: ['obj-photosynthesis'],
        },
      ],
    },
    readingAssets: {
      keywords: ['photosynthesis', 'chlorophyll', 'respiration'],
      keyPhrases: ['light energy', 'cellular respiration'],
      keySentences: ['Photosynthesis converts light energy into chemical energy.', 'Cellular respiration reverses photosynthesis.'],
      keyParagraphs: ['Photosynthesis converts light energy into chemical energy. Chlorophyll absorbs sunlight.', 'Cellular respiration reverses photosynthesis to release energy.'],
    },
    memoryAssets: { memoryHooks: [], associations: [], simpleMemoryNotes: [] },
    assessmentAssets: { mcqs: [], trueFalse: [], recallQuestions: [], applicationQuestions: [] },
    knowledgeGraph: {
      relationships: [
        { type: 'related-to', sourceObjectId: 'obj-photosynthesis', targetObjectId: 'obj-respiration' },
        // Cellular Respiration builds upon Photosynthesis — Photosynthesis is the prerequisite.
        { type: 'builds-upon', sourceObjectId: 'obj-respiration', targetObjectId: 'obj-photosynthesis' },
      ],
    },
    aiMentorContext: { beginnerExplanation: null, simpleExplanation: null, realLifeExample: null, commonDoubts: [] },
    recommendationIntelligence: { difficultConcepts: [], suggestedReadingOrder: [], revisionPriority: [] },
    createdAt: FIXED_NOW().toISOString(),
    lastModifiedAt: FIXED_NOW().toISOString(),
    ...overrides,
  }
}
