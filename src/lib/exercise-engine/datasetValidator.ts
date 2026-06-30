// Dataset Validator™ — graceful empty state handling.
// Exercises never crash when datasets are empty or missing.
// Every function returns a safe default or a meaningful error message.

import type { ContentItem, DifficultyTier, ContentType } from '@/types/exercise-engine'
import { listDatasets, getDataset } from './contentEngine'

export type DatasetValidationResult = {
  isValid: boolean
  itemCount: number
  missingTiers: DifficultyTier[]
  warnings: string[]
  errors: string[]
}

// Validate a dataset has sufficient items for exercise use
export function validateDataset(
  datasetId: string,
  minItemsPerTier = 5,
): DatasetValidationResult {
  const dataset = getDataset(datasetId)
  const result: DatasetValidationResult = {
    isValid: false,
    itemCount: 0,
    missingTiers: [],
    warnings: [],
    errors: [],
  }

  if (!dataset) {
    result.errors.push(`Dataset '${datasetId}' is not registered.`)
    return result
  }

  result.itemCount = dataset.items.length

  if (result.itemCount === 0) {
    result.errors.push(`Dataset '${datasetId}' has no items.`)
    return result
  }

  const tiers: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert']
  for (const tier of tiers) {
    const count = dataset.items.filter((i) => i.difficulty === tier).length
    if (count < minItemsPerTier) {
      result.missingTiers.push(tier)
      result.warnings.push(
        `Tier '${tier}' has only ${count} items (minimum ${minItemsPerTier} recommended).`,
      )
    }
  }

  result.isValid = result.errors.length === 0
  return result
}

// Get a user-facing message when a dataset or query returns no results
export function getEmptyStateMessage(
  contentType: ContentType,
  locale?: string,
): string {
  const typeLabel: Record<ContentType, string> = {
    word: 'words',
    phrase: 'phrases',
    sentence: 'sentences',
    number: 'numbers',
    symbol: 'symbols',
    icon: 'icons',
    image: 'images',
    shape: 'shapes',
    letter: 'letters',
    paragraph: 'paragraphs',
    'memory-card': 'memory cards',
  }

  const type = typeLabel[contentType] ?? contentType
  const langPart = locale && locale !== 'en' ? ` in ${locale}` : ''
  return `No ${type}${langPart} found. Check that the dataset is registered in datasets/index.ts.`
}

// Ensure a minimum number of items — pads with repeats if pool is too small.
// Prevents exercises from failing with partial sessions.
export function ensureMinItems(
  items: ContentItem[],
  minCount: number,
  seed: number,
): ContentItem[] {
  if (items.length === 0) return []
  if (items.length >= minCount) return items

  const padded = [...items]
  let s = seed
  while (padded.length < minCount) {
    const idx = s % items.length
    const item = items[idx]
    if (item !== undefined) padded.push({ ...item, id: `${item.id}-dup-${padded.length}` })
    s = (s * 1664525 + 1013904223) >>> 0
  }
  return padded.slice(0, minCount)
}

// Summarise all registered datasets — useful for admin dashboards
export type DatasetSummary = {
  id: string
  contentType: string
  locale: string
  totalItems: number
  itemsByTier: Record<DifficultyTier, number>
}

export function getDatasetSummaries(): DatasetSummary[] {
  return listDatasets().map((ds) => ({
    id: ds.id,
    contentType: ds.contentType,
    locale: ds.locale,
    totalItems: ds.items.length,
    itemsByTier: {
      beginner: ds.items.filter((i) => i.difficulty === 'beginner').length,
      easy: ds.items.filter((i) => i.difficulty === 'easy').length,
      medium: ds.items.filter((i) => i.difficulty === 'medium').length,
      advanced: ds.items.filter((i) => i.difficulty === 'advanced').length,
      expert: ds.items.filter((i) => i.difficulty === 'expert').length,
      adaptive: ds.items.filter((i) => i.difficulty === 'adaptive').length,
    },
  }))
}
