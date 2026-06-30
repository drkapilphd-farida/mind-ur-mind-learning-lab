// Universal Intelligence Dataset™ — Rich Dataset Type System
//
// DatasetImportItem: the rich format used when defining or importing content.
// At runtime ContentItem (from index.ts) is used for efficiency — lean and
// fast. DatasetImportItem converts to ContentItem via toContentItem().
//
// This architecture supports 500,000+ words, 100,000+ images, millions of
// PDF-derived objects, and AI-generated content without changing any engine code.

import type { DifficultyTier, DatasetCategory, Locale, ContentType } from './index'

// ── Asset types ──────────────────────────────────────────────────────────

export type DatasetAssetType =
  | 'text'          // plain text word/phrase/sentence
  | 'number'        // numeric string
  | 'symbol'        // single character/symbol
  | 'letter'        // alphabetic character
  | 'shape'         // named shape concept
  | 'color'         // color name/concept
  | 'icon'          // lucide or SVG icon reference
  | 'image'         // image file path/URL
  | 'illustration'  // colorful illustration
  | 'diagram'       // educational diagram
  | 'audio'         // audio clip (future)
  | 'video'         // video snippet (future)
  | 'pdf-chunk'     // text extracted from PDF (future AI Learning Studio)
  | 'ai-generated'  // AI-created content (future)

// ── Rich dataset item (import/definition format) ─────────────────────────

// This is the canonical format for defining dataset items.
// The engine converts these to lightweight ContentItem objects at registration.
// Admin CMS, CSV upload, JSON import all produce DatasetImportItems.
export type DatasetImportItem = {
  // Required
  id: string
  content: string           // the primary stimulus text / identifier
  contentLabel: string      // accessible label (differs from content for icons/images)
  difficulty: DifficultyTier
  locale: Locale
  assetType: DatasetAssetType

  // Classification
  categories?: DatasetCategory[]
  tags?: string[]           // free-form tags for search/filter
  subcategory?: string      // e.g. 'animals', 'nature', 'verbs'

  // Media references (resolved at display time by the exercise player)
  imagePath?: string        // e.g. '/datasets/images/cat.webp'
  iconPath?: string         // e.g. 'lucide:Cat' or '/icons/cat.svg'
  colorHex?: string         // e.g. '#FF5733' for color exercises
  altText?: string          // fallback if media fails to load

  // Rich text variants
  phonetic?: string         // e.g. Hindi transliteration or IPA
  translation?: string      // English translation for non-English content
  exampleSentence?: string  // usage in context

  // Future media (architecture only — fields stored, not yet rendered)
  futureAudio?: string      // audio pronunciation path
  futureVideo?: string      // video explanation path
  futurePDFReference?: {    // origin document for PDF-derived content
    documentId: string
    pageNumber: number
    excerpt: string
  }
  futureAI?: {              // AI-generated content metadata
    model: string
    prompt: string
    confidence: number
  }
}

// ── Dataset import file format ────────────────────────────────────────────

// The schema for bulk-upload JSON files.
// Stored in public/datasets/{locale}/{contentType}/{difficulty}.json
// Future admin CMS generates and uploads these files.
export type DatasetImportFile = {
  version: '1.0'
  locale: Locale
  contentType: ContentType
  difficulty: DifficultyTier
  categories: DatasetCategory[]
  items: DatasetImportItem[]
  metadata: {
    author: string
    createdAt: string     // ISO 8601
    totalItems: number
    language: string      // human-readable language name
    description: string
  }
}

// ── Import configuration ─────────────────────────────────────────────────

export type ImportSourceType = 'json' | 'csv' | 'excel' | 'api' | 'ai-generated' | 'pdf'

export type ImportConfig = {
  sourceType: ImportSourceType
  locale: Locale
  contentType: ContentType
  defaultDifficulty?: DifficultyTier
  defaultCategories?: DatasetCategory[]
  // For CSV/Excel: which column maps to which field
  columnMapping?: {
    content?: string
    contentLabel?: string
    difficulty?: string
    tags?: string
    imagePath?: string
  }
  // For API imports
  apiEndpoint?: string
  apiKey?: string       // stored server-side only, never exposed to client
}

// Import result — always returns successes + errors, never throws
export type ImportResult = {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{ row: number; message: string }>
  datasetId: string
}

// ── AI Learning Studio architecture ──────────────────────────────────────

// Future flow: PDF Upload → Extraction → UniversalDataset → Runtime → Score
// No implementation — types only. When built, these plug into the existing
// DatasetLoader without changing any exercise or player code.

export type PDFExtractionConfig = {
  documentId: string
  documentPath: string
  extractionMode: 'words' | 'phrases' | 'sentences' | 'paragraphs' | 'key-concepts'
  targetLocale: Locale
  targetDifficulty: DifficultyTier
  targetCategories: DatasetCategory[]
  // Future AI enrichment
  generateAltText?: boolean
  generatePhonetics?: boolean
  generateTranslations?: boolean
  targetLocalesForTranslation?: Locale[]
}

export type AIGenerationConfig = {
  model: string             // e.g. 'claude-haiku-4-5-20251001'
  contentType: ContentType
  locale: Locale
  difficulty: DifficultyTier
  categories: DatasetCategory[]
  count: number
  prompt: string            // seed prompt for generation
  qualityThreshold: number  // 0–1: minimum confidence to include
}

// ── Future Dataset Builder (Admin CMS schema) ─────────────────────────────

// Admin CMS will produce DatasetBuildRequest objects; the platform executes them.
// No UI implementation yet — types only.
export type DatasetBuildRequest = {
  type: 'upload' | 'generate' | 'extract-pdf' | 'import-api'
  config: ImportConfig | AIGenerationConfig | PDFExtractionConfig
  targetDatasetId: string   // merge into existing or create new
  scheduledAt?: string      // ISO 8601, for batch processing
  createdBy: string         // admin user ID
}
