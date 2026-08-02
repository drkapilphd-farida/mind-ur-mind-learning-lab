// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 10F.
// Observation Intelligence™'s per-image question registry — mirrors
// mandalaObservationQuestions.ts's exact pattern (real, objectively-
// verifiable questions checked against the real generated artwork), a
// small deliberate local duplicate rather than a cross-import, keyed by
// image id instead of level order. A flat Record, trivially extensible:
// adding a 13th image is one more pool entry (imagePersistencePool.ts) plus
// one more entry here — no architecture change needed for 1000+ images.
//
// Sprint 10F enhancement: reduced to exactly ONE question per image (was
// 3) — "reduce friction, maximum 2-3 interactions per image." Each category
// keeps whichever single question is most fitting and already real/
// verified against the generated artwork; 2 categories substitute the
// brief's suggested feature (facing direction / eye colour, hair colour)
// since neither is a real feature of these symmetrical, hairless
// self-generated SVGs — disclosed here rather than fabricated.

import type { ImagePersistenceCategory } from './imagePersistencePool'
import type { ObservationQuestion, ObservationQuestionOption } from './mandalaObservationQuestions'

export type ImagePersistenceObservationQuestionSet = {
  imageId: string
  questions: readonly ObservationQuestion[]
}

const COUNT_QUESTION_TEXT: Record<ImagePersistenceCategory, string> = {
  mandala: 'How many rings did you notice?',
  'sacred-geometry': 'How many center layers/points did you notice?',
  flowers: 'How many petals did you notice?',
  'everyday-objects': 'How many rising or radiating lines did you notice?',
  // Brief suggested "facing direction" — not a real feature of these
  // symmetrical, forward-facing SVGs, so the already-real count question
  // is used instead.
  animals: 'How many feather or whisker lines did you notice?',
  // Brief suggested eye colour/hair colour/face direction — none are real
  // features of this abstract geometric face motif (no hair drawn,
  // symmetrical, fixed eye colour), so the already-real halo-ring count is
  // used instead.
  'human-faces': 'How many halo rings did you notice behind the head?',
}

function countQuestion(category: ImagePersistenceCategory, correctCount: number): ObservationQuestion {
  const distractors = [correctCount - 1, correctCount + 1, correctCount + 2].filter((n) => n >= 1 && n !== correctCount)
  const counts = Array.from(new Set([correctCount, ...distractors])).slice(0, 3)
  const options: ObservationQuestionOption[] = [...counts.map((count) => ({ id: `count-${count}`, label: String(count) })), { id: 'not-sure', label: 'Not Sure' }]
  return { id: 'element-count', text: COUNT_QUESTION_TEXT[category], options, correctOptionId: `count-${correctCount}` }
}

const COLOR_PALETTE = ['Coral', 'Gold', 'Teal', 'Violet', 'Indigo', 'Emerald', 'Cyan', 'Slate', 'Orange', 'Pink', 'Sky Blue'] as const

function dominantColorQuestion(correctColor: string): ObservationQuestion {
  const distractors = COLOR_PALETTE.filter((color) => color !== correctColor).slice(0, 3)
  const options: ObservationQuestionOption[] = [correctColor, ...distractors].map((color) => ({
    id: `colour-${color.toLowerCase().replace(/\s+/g, '-')}`,
    label: color,
  }))
  return {
    id: 'dominant-colour',
    text: 'Which colour appeared strongest?',
    options,
    correctOptionId: `colour-${correctColor.toLowerCase().replace(/\s+/g, '-')}`,
  }
}

export const IMAGE_PERSISTENCE_OBSERVATION_QUESTIONS: Record<string, ImagePersistenceObservationQuestionSet> = {
  'flowers-1': { imageId: 'flowers-1', questions: [countQuestion('flowers', 5)] },
  'flowers-2': { imageId: 'flowers-2', questions: [countQuestion('flowers', 8)] },

  // Sprint 53 — Premium Image Asset Library™. All 3 new mandala designs
  // have exactly 6 petal rings by construction (see MANDALA_DESIGNS in
  // imagePersistenceAssetKit.ts) — a real, verifiable count against the
  // actual generated artwork, same principle as every other entry here.
  'mandala-01': { imageId: 'mandala-01', questions: [countQuestion('mandala', 6)] },
  'mandala-02': { imageId: 'mandala-02', questions: [countQuestion('mandala', 6)] },
  'mandala-03': { imageId: 'mandala-03', questions: [countQuestion('mandala', 6)] },

  'sacred-geometry-1': { imageId: 'sacred-geometry-1', questions: [countQuestion('sacred-geometry', 6)] },
  'sacred-geometry-2': { imageId: 'sacred-geometry-2', questions: [countQuestion('sacred-geometry', 8)] },

  'everyday-objects-1': { imageId: 'everyday-objects-1', questions: [dominantColorQuestion('Cyan')] },
  'everyday-objects-2': { imageId: 'everyday-objects-2', questions: [dominantColorQuestion('Gold')] },

  'animals-1': { imageId: 'animals-1', questions: [countQuestion('animals', 3)] },
  'animals-2': { imageId: 'animals-2', questions: [countQuestion('animals', 4)] },

  // Sprint 53 — counts taken directly from each design's haloRings array in
  // imagePersistenceAssetKit.ts (real, verifiable against the actual SVG).
  'human-face-01': { imageId: 'human-face-01', questions: [countQuestion('human-faces', 3)] },
  'human-face-02': { imageId: 'human-face-02', questions: [countQuestion('human-faces', 4)] },
  'human-face-03': { imageId: 'human-face-03', questions: [countQuestion('human-faces', 3)] },
  'human-face-04': { imageId: 'human-face-04', questions: [countQuestion('human-faces', 4)] },
}
