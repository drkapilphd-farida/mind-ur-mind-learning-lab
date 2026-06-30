// Content Engine™ — universal dataset abstraction.
//
// No exercise should know where its content comes from. This registry maps
// dataset IDs to ContentDataset objects. Future admin CMS, PDF uploads, and
// multilingual packs simply register a new dataset; exercises reference it
// by ID in their ExerciseDefinition.

import type { ContentDataset, ContentItem, DifficultyTier, Locale } from '@/types/exercise-engine'

// Global dataset registry — populated at module initialisation.
const REGISTRY = new Map<string, ContentDataset>()

export function registerDataset(dataset: ContentDataset): void {
  REGISTRY.set(dataset.id, dataset)
}

export function getDataset(id: string): ContentDataset | null {
  return REGISTRY.get(id) ?? null
}

export function listDatasets(locale?: Locale): ContentDataset[] {
  const all = Array.from(REGISTRY.values())
  return locale ? all.filter((d) => d.locale === locale) : all
}

// Create a ContentDataset from a flat array of items with difficulty tags.
// This is how Sprint 4C-1's wordLists.ts would register its content.
export function createDataset(params: {
  id: string
  locale: Locale
  contentType: ContentDataset['contentType']
  rawItems: Array<{ content: string; difficulty: DifficultyTier; metadata?: Record<string, unknown> }>
}): ContentDataset {
  const items: ContentItem[] = params.rawItems.map((raw, idx) => ({
    id: `${params.id}-${idx}`,
    content: raw.content,
    contentLabel: raw.content,
    difficulty: raw.difficulty,
    locale: params.locale,
    // exactOptionalPropertyTypes: omit the key entirely when undefined
    ...(raw.metadata !== undefined ? { metadata: raw.metadata } : {}),
  }))

  const dataset: ContentDataset = {
    id: params.id,
    locale: params.locale,
    contentType: params.contentType,
    items,
    getItemsByDifficulty: (tier: DifficultyTier) => items.filter((i) => i.difficulty === tier),
  }

  registerDataset(dataset)
  return dataset
}

// ── Built-in datasets ────────────────────────────────────────────────────────
// These register themselves on import. Exercise Definitions reference them
// by ID ('english-words-foundation', etc.) — never by direct import.

// English word dataset (Foundation)
export const ENGLISH_WORDS_FOUNDATION = createDataset({
  id: 'english-words-foundation',
  locale: 'en',
  contentType: 'word',
  rawItems: [
    // Beginner: short, high-frequency
    { content: 'cat', difficulty: 'beginner' }, { content: 'dog', difficulty: 'beginner' },
    { content: 'sun', difficulty: 'beginner' }, { content: 'run', difficulty: 'beginner' },
    { content: 'big', difficulty: 'beginner' }, { content: 'sky', difficulty: 'beginner' },
    { content: 'hot', difficulty: 'beginner' }, { content: 'cold', difficulty: 'beginner' },
    { content: 'blue', difficulty: 'beginner' }, { content: 'fast', difficulty: 'beginner' },
    { content: 'calm', difficulty: 'beginner' }, { content: 'bold', difficulty: 'beginner' },
    { content: 'read', difficulty: 'beginner' }, { content: 'mind', difficulty: 'beginner' },
    { content: 'grow', difficulty: 'beginner' }, { content: 'flow', difficulty: 'beginner' },
    // Easy: medium length
    { content: 'focus', difficulty: 'easy' }, { content: 'brain', difficulty: 'easy' },
    { content: 'speed', difficulty: 'easy' }, { content: 'light', difficulty: 'easy' },
    { content: 'power', difficulty: 'easy' }, { content: 'learn', difficulty: 'easy' },
    { content: 'sharp', difficulty: 'easy' }, { content: 'think', difficulty: 'easy' },
    { content: 'clear', difficulty: 'easy' }, { content: 'aware', difficulty: 'easy' },
    { content: 'quick', difficulty: 'easy' }, { content: 'grasp', difficulty: 'easy' },
    // Medium: longer words
    { content: 'reading', difficulty: 'medium' }, { content: 'pattern', difficulty: 'medium' },
    { content: 'balance', difficulty: 'medium' }, { content: 'control', difficulty: 'medium' },
    { content: 'mastery', difficulty: 'medium' }, { content: 'clarity', difficulty: 'medium' },
    { content: 'insight', difficulty: 'medium' }, { content: 'develop', difficulty: 'medium' },
    // Advanced: complex or abstract
    { content: 'cognitive', difficulty: 'advanced' }, { content: 'retention', difficulty: 'advanced' },
    { content: 'velocity', difficulty: 'advanced' }, { content: 'bandwidth', difficulty: 'advanced' },
    // Expert: rare or technical
    { content: 'tachistoscope', difficulty: 'expert' }, { content: 'perception', difficulty: 'expert' },
  ],
})

// English phrase dataset (Foundation)
export const ENGLISH_PHRASES_FOUNDATION = createDataset({
  id: 'english-phrases-foundation',
  locale: 'en',
  contentType: 'phrase',
  rawItems: [
    { content: 'read fast', difficulty: 'beginner' },
    { content: 'stay calm', difficulty: 'beginner' },
    { content: 'mind grows', difficulty: 'beginner' },
    { content: 'eyes open', difficulty: 'beginner' },
    { content: 'think clear', difficulty: 'beginner' },
    { content: 'mind over matter', difficulty: 'easy' },
    { content: 'keep going now', difficulty: 'easy' },
    { content: 'see more clearly', difficulty: 'easy' },
    { content: 'train your brain', difficulty: 'easy' },
    { content: 'your brain is adapting', difficulty: 'medium' },
    { content: 'reading speed is growing', difficulty: 'medium' },
    { content: 'every session builds strength', difficulty: 'advanced' },
    { content: 'consistency is your power', difficulty: 'advanced' },
  ],
})
