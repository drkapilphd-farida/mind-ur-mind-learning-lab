import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import type { AssessmentAssets } from '@/core/universal-learning-engine/learning-blueprint'

export const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

// A hand-built, minimal-but-realistic LearningAssetBundle — every Tier-1
// builder in this module operates purely on this real shape (plus, for
// Assessment, a sibling AssessmentAssets.mcqs array), so unit tests
// construct it directly rather than running the full Blueprint/Assets
// pipeline, mirroring learning-assets/internal/testFixtures.ts's own
// pattern.
export function makeBundle(overrides: Partial<LearningAssetBundle> = {}): LearningAssetBundle {
  return {
    bundleId: 'bundle-1',
    documentId: 'doc-1',
    chapterId: 'chunk-1',
    version: 1,
    learningObjects: [
      {
        objectId: 'obj-photosynthesis',
        title: 'Photosynthesis',
        type: 'concept',
        importance: 0.9,
        difficulty: 'beginner',
        estimatedLearningTime: 30,
        definition: 'The process of converting light into chemical energy.',
        explanation: null,
        examples: ['plants making glucose from sunlight'],
        misconceptions: ['Photosynthesis only happens at night.'],
        keywords: ['photosynthesis'],
        keyPhrases: ['light energy'],
        keySentences: ['Photosynthesis converts light energy into chemical energy.'],
        keyParagraphIds: ['chunk-1-paragraph-0'],
        relatedObjects: ['obj-respiration'],
        prerequisiteObjects: [],
        dependentObjects: ['obj-respiration'],
      },
      {
        objectId: 'obj-respiration',
        title: 'Cellular Respiration',
        type: 'concept',
        importance: 0.7,
        difficulty: 'intermediate',
        estimatedLearningTime: 20,
        definition: 'The process cells use to release energy from glucose.',
        explanation: null,
        examples: [],
        misconceptions: [],
        keywords: ['respiration'],
        keyPhrases: ['cellular respiration'],
        keySentences: [],
        keyParagraphIds: [],
        relatedObjects: ['obj-photosynthesis'],
        prerequisiteObjects: ['obj-photosynthesis'],
        dependentObjects: [],
      },
    ],
    keywordAssets: [
      { keyword: 'photosynthesis', learningObjectReference: 'obj-photosynthesis' },
      { keyword: 'chlorophyll', learningObjectReference: null },
    ],
    wordAssets: [
      { word: 'photosynthesis', priority: 2, learningObjectReference: 'obj-photosynthesis' },
      { word: 'respiration', priority: 1, learningObjectReference: 'obj-respiration' },
      { word: 'chlorophyll', priority: 0, learningObjectReference: null },
    ],
    phraseAssets: [{ phrase: 'light energy', phraseType: 'concept-phrase', relatedLearningObject: 'obj-photosynthesis' }],
    sentenceAssets: [{ keySentence: 'Photosynthesis converts light energy into chemical energy.', importance: 0.8, explanationReference: 'obj-photosynthesis' }],
    paragraphAssets: [{ paragraphId: 'chunk-1-paragraph-0', importance: 0.6, summary: 'Photosynthesis converts light energy into chemical energy.', relatedLearningObjects: ['obj-photosynthesis'] }],
    createdAt: FIXED_NOW().toISOString(),
    ...overrides,
  }
}

// Real shape produced by buildStructuralAssessmentItems.ts (Sprint 1) —
// every mcq is a definition question, matching its own real template.
export function makeMcqs(overrides: Partial<AssessmentAssets['mcqs'][number]>[] = []): AssessmentAssets['mcqs'] {
  const defaults: AssessmentAssets['mcqs'] = [
    {
      question: 'What is the definition of "Photosynthesis"?',
      options: ['The process of converting light into chemical energy.', 'The process cells use to release energy from glucose.'],
      correctAnswerIndex: 0,
    },
    {
      question: 'What is the definition of "Cellular Respiration"?',
      options: ['The process cells use to release energy from glucose.', 'The process of converting light into chemical energy.'],
      correctAnswerIndex: 0,
    },
  ]
  return overrides.length === 0 ? defaults : (overrides as AssessmentAssets['mcqs'])
}
