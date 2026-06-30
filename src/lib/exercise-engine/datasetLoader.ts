// Universal Dataset Loader™
//
// The primary API for exercises to request content. Wraps the low-level
// registry and query functions with a richer, options-based interface.
// Supports future pagination, lazy loading, and media filtering without
// changing any exercise code — only the loader implementation changes.

import type {
  ContentItem,
  ContentDataset,
  ContentType,
  DifficultyTier,
  DatasetCategory,
  Locale,
  DatasetQuery,
} from '@/types/exercise-engine'
import type { DatasetImportItem, ImportConfig, ImportResult } from '@/types/exercise-engine/dataset'
import { getDataset, listDatasets, createDataset } from './contentEngine'
import {
  getItemsByLanguage,
  getItemsByCategory,
  getItemsByDifficulty,
  getNextExerciseContent,
} from './datasetEngine'
import { shuffleArray, pickItems } from './randomizationEngine'

// ── Core loader functions ─────────────────────────────────────────────────

// Load a specific registered dataset by ID. Returns null if not found.
export function loadDataset(id: string): ContentDataset | null {
  return getDataset(id)
}

// Load all items belonging to a category across all registered datasets.
export function loadCategory(
  category: DatasetCategory,
  options?: { locale?: Locale; limit?: number; seed?: number },
): ContentItem[] {
  let items = getItemsByCategory(category)
  if (options?.locale) items = items.filter((i) => i.locale === options.locale)
  if (options?.seed !== undefined && options.limit !== undefined) {
    return pickItems(items, options.limit, options.seed)
  }
  return options?.limit !== undefined ? items.slice(0, options.limit) : items
}

// Load items at a specific difficulty tier.
export function loadDifficulty(
  difficulty: DifficultyTier,
  options?: { contentType?: ContentType; locale?: Locale; limit?: number; seed?: number },
): ContentItem[] {
  let items = getItemsByDifficulty(difficulty, options?.contentType)
  if (options?.locale) items = items.filter((i) => i.locale === options.locale)
  if (options?.seed !== undefined && options.limit !== undefined) {
    return pickItems(items, options.limit, options.seed)
  }
  return options?.limit !== undefined ? items.slice(0, options.limit) : items
}

// Load all items for a locale across all registered datasets.
export function loadLanguage(
  locale: Locale,
  options?: { contentType?: ContentType; limit?: number; seed?: number },
): ContentItem[] {
  let items = getItemsByLanguage(locale)
  if (options?.contentType) {
    const typedDatasets = listDatasets(locale).filter((d) => d.contentType === options.contentType)
    items = typedDatasets.flatMap((d) => d.items)
  }
  if (options?.seed !== undefined && options.limit !== undefined) {
    return pickItems(items, options.limit, options.seed)
  }
  return options?.limit !== undefined ? items.slice(0, options.limit) : items
}

// Load randomized content for an exercise session.
// The primary function most exercises call — wraps getNextExerciseContent
// with a friendlier options object.
export function loadRandom(query: DatasetQuery): ContentItem[] {
  return getNextExerciseContent(query)
}

// Load a paginated batch — for lazy-loading large datasets.
export type BatchOptions = {
  contentType?: ContentType
  locale?: Locale
  difficulty?: DifficultyTier
  pageSize: number
  pageIndex: number   // 0-based
  seed?: number
}

export type BatchResult = {
  items: ContentItem[]
  pageIndex: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function loadBatch(options: BatchOptions): BatchResult {
  let pool: ContentItem[] = listDatasets().flatMap((d) => d.items)

  if (options.contentType) {
    const matching = listDatasets().filter((d) => d.contentType === options.contentType)
    pool = matching.flatMap((d) => d.items)
  }
  if (options.locale) pool = pool.filter((i) => i.locale === options.locale)
  if (options.difficulty) pool = pool.filter((i) => i.difficulty === options.difficulty)

  // Deterministic order for pagination (seeded shuffle for consistency)
  const ordered = options.seed !== undefined ? shuffleArray(pool, options.seed) : pool
  const start = options.pageIndex * options.pageSize
  const end = start + options.pageSize

  return {
    items: ordered.slice(start, end),
    pageIndex: options.pageIndex,
    pageSize: options.pageSize,
    totalItems: ordered.length,
    hasNextPage: end < ordered.length,
    hasPrevPage: options.pageIndex > 0,
  }
}

// Load items that have media metadata (imagePath, iconPath, colorHex).
// Used by exercises that render images, icons, or colors rather than text.
export function loadMedia(options: {
  mediaType: 'image' | 'icon' | 'color'
  locale?: Locale
  difficulty?: DifficultyTier
  limit?: number
  seed?: number
}): ContentItem[] {
  const metadataKey = options.mediaType === 'image' ? 'imagePath'
    : options.mediaType === 'icon' ? 'iconPath'
    : 'colorHex'

  let items = listDatasets()
    .flatMap((d) => d.items)
    .filter((i) => i.metadata?.[metadataKey] !== undefined)

  if (options.locale) items = items.filter((i) => i.locale === options.locale)
  if (options.difficulty) items = items.filter((i) => i.difficulty === options.difficulty)

  if (options.seed !== undefined && options.limit !== undefined) {
    return pickItems(items, options.limit, options.seed)
  }
  return options.limit !== undefined ? items.slice(0, options.limit) : items
}

// ── Paginated loader factory ───────────────────────────────────────────────

// Returns a stateful paginator — designed for future React hook integration.
// Supports 100,000+ items efficiently via page-by-page loading.
export type PaginatedLoader = {
  loadPage: (pageIndex: number) => BatchResult
  totalItems: number
  totalPages: number
  pageSize: number
}

export function createPaginatedLoader(
  options: Omit<BatchOptions, 'pageIndex'>,
): PaginatedLoader {
  // Compute total once; pages are sliced on demand
  const dummy = loadBatch({ ...options, pageIndex: 0 })
  const totalPages = Math.ceil(dummy.totalItems / options.pageSize)

  return {
    loadPage: (pageIndex: number) => loadBatch({ ...options, pageIndex }),
    totalItems: dummy.totalItems,
    totalPages,
    pageSize: options.pageSize,
  }
}

// ── Import architecture ───────────────────────────────────────────────────

// Convert a rich DatasetImportItem to a lean ContentItem for the registry.
// Called by all import paths (JSON, CSV, Excel, API, AI-generated).
export function toContentItem(importItem: DatasetImportItem): ContentItem {
  return {
    id: importItem.id,
    content: importItem.content,
    contentLabel: importItem.contentLabel,
    difficulty: importItem.difficulty,
    locale: importItem.locale,
    ...(importItem.categories ? { categories: importItem.categories } : {}),
    ...(Object.keys(buildMetadata(importItem)).length > 0
      ? { metadata: buildMetadata(importItem) }
      : {}),
  }
}

function buildMetadata(item: DatasetImportItem): Record<string, unknown> {
  const meta: Record<string, unknown> = {}
  if (item.imagePath !== undefined) meta.imagePath = item.imagePath
  if (item.iconPath !== undefined) meta.iconPath = item.iconPath
  if (item.colorHex !== undefined) meta.colorHex = item.colorHex
  if (item.altText !== undefined) meta.altText = item.altText
  if (item.phonetic !== undefined) meta.phonetic = item.phonetic
  if (item.translation !== undefined) meta.translation = item.translation
  if (item.tags !== undefined) meta.tags = item.tags
  if (item.subcategory !== undefined) meta.subcategory = item.subcategory
  if (item.assetType !== undefined) meta.assetType = item.assetType
  return meta
}

// Register a dataset from an array of DatasetImportItems.
// This is the single entry point for ALL import sources.
export function importDataset(params: {
  id: string
  locale: Locale
  contentType: ContentType
  items: DatasetImportItem[]
}): ContentDataset {
  return createDataset({
    id: params.id,
    locale: params.locale,
    contentType: params.contentType,
    rawItems: params.items.map((item) => ({
      content: item.content,
      difficulty: item.difficulty,
      ...(item.categories ? { categories: item.categories } : {}),
      metadata: buildMetadata(item),
    })),
  })
}

// Stub for future CSV import — architecture in place, implementation pending admin CMS.
export async function importFromCSV(
  csvContent: string,
  config: ImportConfig,
): Promise<ImportResult> {
  void csvContent; void config  // silence unused warnings
  // Future: parse CSV rows → DatasetImportItem[] → importDataset()
  return {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [{ row: 0, message: 'CSV import requires the Admin CMS (Sprint 6A).' }],
    datasetId: '',
  }
}

// Stub for future JSON file import from public/datasets/
export async function importFromJSON(
  jsonPath: string,
  _config?: Partial<ImportConfig>,
): Promise<ImportResult> {
  try {
    const response = await fetch(jsonPath)
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
    const file = await response.json() as { items?: DatasetImportItem[]; metadata?: { totalItems?: number } }
    if (!Array.isArray(file.items)) throw new Error('Invalid dataset file format')

    // Register the imported items
    const imported = importDataset({
      id: jsonPath,
      locale: 'en',
      contentType: 'word',
      items: file.items,
    })

    return {
      success: true,
      imported: imported.items.length,
      skipped: (file.metadata?.totalItems ?? file.items.length) - imported.items.length,
      errors: [],
      datasetId: jsonPath,
    }
  } catch (e) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [{ row: 0, message: e instanceof Error ? e.message : 'Unknown error' }],
      datasetId: '',
    }
  }
}

// Re-export for convenience
export { avoidRecentRepeats } from './datasetEngine'
export { generateSessionSeed } from './randomizationEngine'
