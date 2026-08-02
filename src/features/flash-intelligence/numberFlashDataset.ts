// Number Flash™ Dataset — loads its content from a real, generated JSON
// data file (data/numberFlashDataset.json) rather than any number typed
// directly into application code. Unlike Word Flash's curated words
// (where "real vs. meaningless" matters), any N-digit number is equally
// valid content, so the dataset is generated, not hand-authored — see the
// header comment in the JSON file for the generation approach (a fixed
// seed through the same LCG randomizationEngine.ts already uses, so it's
// reproducible, not random noise).
//
// contentType is 'number', shared with Rapid Visual Intelligence™'s Flash
// Numbers™ dataset — Number Flash succeeds it, same reasoning Word Flash
// used for sharing 'word' with Flash Words™.

import { createDataset } from '@/lib/exercise-engine/contentEngine'
import type { DifficultyTier } from '@/types/exercise-engine'
import numberFlashRawData from './data/numberFlashDataset.json'

type RawNumberEntry = { content: string; difficulty: string }

const rawItems = (numberFlashRawData.items as RawNumberEntry[]).map((entry) => ({
  content: entry.content,
  difficulty: entry.difficulty as DifficultyTier,
}))

export const NUMBER_FLASH_DATASET = createDataset({
  id: 'en-number-flash-numbers',
  locale: 'en',
  contentType: 'number',
  rawItems,
})
