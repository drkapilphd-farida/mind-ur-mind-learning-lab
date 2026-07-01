// Exercise Registry — auto-registration for all Rapid Visual Intelligence™ exercises.
//
// Import this file once (e.g. in datasets/index.ts or the registry module) to
// register all exercises with the Exercise Registry™. No runtime changes needed.
//
// Adding a new exercise: create its definition file, add one import+register line here.

import type { ExerciseDefinition } from '@/types/exercise-engine'
import { registerExercise } from '@/lib/exercise-engine/exerciseRegistry'

import { FLASH_WORDS_DEFINITION } from './flashWordsDefinition'
import { FLASH_NUMBERS_DEFINITION } from './flashNumbersDefinition'
import { FLASH_SYMBOLS_DEFINITION } from './flashSymbolsDefinition'
import { FLASH_IMAGES_DEFINITION } from './flashImagesDefinition'
import { FLASH_PHRASES_DEFINITION } from './flashPhrasesDefinition'

// The cast is safe: ExerciseDefinition<TConfig extends Record<string, unknown>>
// is covariant in TConfig — every specific config type satisfies Record<string, unknown>.
function reg(def: ExerciseDefinition<Record<string, unknown>>): void {
  registerExercise(def)
}

reg(FLASH_WORDS_DEFINITION as ExerciseDefinition<Record<string, unknown>>)
reg(FLASH_NUMBERS_DEFINITION as ExerciseDefinition<Record<string, unknown>>)
reg(FLASH_SYMBOLS_DEFINITION as ExerciseDefinition<Record<string, unknown>>)
reg(FLASH_IMAGES_DEFINITION as ExerciseDefinition<Record<string, unknown>>)
reg(FLASH_PHRASES_DEFINITION as ExerciseDefinition<Record<string, unknown>>)

// ── Total registered (Sprint 5C): 5 exercises ──────────────────────────────
// flash-words       · Flash Words™       · word   · reading
// flash-numbers     · Flash Numbers™     · number · reading
// flash-symbols     · Flash Symbols™     · symbol · reading
// flash-images      · Flash Icons™       · icon   · reading
// flash-phrases     · Flash Phrases™     · phrase · reading
