import type { LearningAssetBundle, LearningAssetObject } from '@/core/universal-learning-engine/learning-assets'

export const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

function makeLearningObject(overrides: Partial<LearningAssetObject> = {}): LearningAssetObject {
  return {
    objectId: 'obj-photosynthesis',
    title: 'Photosynthesis',
    type: 'concept',
    importance: 0.9,
    difficulty: 'beginner',
    estimatedLearningTime: 20,
    definition: 'The process of converting light into chemical energy.',
    explanation: 'Plants turn sunlight into food.',
    examples: ['plants making glucose from sunlight'],
    misconceptions: ['Photosynthesis only happens at night.'],
    keywords: ['photosynthesis'],
    keyPhrases: ['light energy'],
    keySentences: ['Photosynthesis converts light into energy.'],
    keyParagraphIds: ['chunk-1-paragraph-0'],
    relatedObjects: [],
    prerequisiteObjects: [],
    dependentObjects: [],
    ...overrides,
  }
}

// A hand-built, minimal-but-realistic `LearningAssetBundle` — every
// module in this engine operates purely on this real shape. Respiration
// builds upon (= depends on) Photosynthesis, mirroring the real
// `learning-assets` fixture's own scenario.
export function makeBundle(overrides: Partial<LearningAssetBundle> = {}): LearningAssetBundle {
  return {
    bundleId: 'bundle-1',
    documentId: 'doc-1',
    chapterId: 'chunk-1',
    version: 1,
    learningObjects: [
      makeLearningObject({ objectId: 'obj-photosynthesis', title: 'Photosynthesis', importance: 0.9, difficulty: 'beginner', relatedObjects: ['obj-respiration'] }),
      makeLearningObject({
        objectId: 'obj-respiration',
        title: 'Cellular Respiration',
        importance: 0.7,
        difficulty: 'intermediate',
        definition: null,
        explanation: null,
        examples: [],
        misconceptions: [],
        prerequisiteObjects: ['obj-photosynthesis'],
        relatedObjects: ['obj-photosynthesis'],
        estimatedLearningTime: 15,
      }),
    ],
    keywordAssets: [
      { keyword: 'photosynthesis', learningObjectReference: 'obj-photosynthesis' },
      { keyword: 'respiration', learningObjectReference: 'obj-respiration' },
    ],
    wordAssets: [
      { word: 'photosynthesis', priority: 1, learningObjectReference: 'obj-photosynthesis' },
      { word: 'respiration', priority: 0.5, learningObjectReference: 'obj-respiration' },
    ],
    phraseAssets: [
      { phrase: 'cellular respiration', phraseType: 'concept-phrase', relatedLearningObject: 'obj-respiration' },
      { phrase: 'light into chemical', phraseType: 'definition-phrase', relatedLearningObject: 'obj-photosynthesis' },
    ],
    sentenceAssets: [
      { keySentence: 'Photosynthesis converts light energy into chemical energy.', importance: 1, explanationReference: 'obj-photosynthesis' },
      { keySentence: 'Cellular respiration reverses photosynthesis.', importance: 0.5, explanationReference: 'obj-respiration' },
    ],
    paragraphAssets: [
      { paragraphId: 'chunk-1-paragraph-0', importance: 1, summary: 'Photosynthesis converts light energy into chemical energy.', relatedLearningObjects: ['obj-photosynthesis'] },
      {
        paragraphId: 'chunk-1-paragraph-1',
        importance: 0.5,
        summary: 'Cellular respiration reverses photosynthesis.',
        relatedLearningObjects: ['obj-photosynthesis', 'obj-respiration'],
      },
    ],
    createdAt: FIXED_NOW().toISOString(),
    ...overrides,
  }
}
