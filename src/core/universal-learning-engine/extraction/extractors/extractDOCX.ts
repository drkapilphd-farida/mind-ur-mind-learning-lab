import mammoth from 'mammoth'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { ExtractionResult } from '../errors/ExtractionError'
import { buildUniversalLearningDocument } from '../services/buildUniversalLearningDocument'
import { normalizeContent } from '../services/normalizeContent'
import type { LearningContentBlock, LearningSection } from '../types/UniversalLearningDocument'

export type ConvertDocxToHtmlFn = (file: File) => Promise<string>

// Sprint UCE-3A (additive) — mammoth's own documented convertImage hook
// (mammoth.images.imgElement) marks each real embedded image with a
// detectable attribute pair carrying its real content-type. mammoth
// automatically adds a real `alt` attribute too, when the source
// document has real alt-text (element.altText) — never invented here.
// This is presence + content-type detection only: no OCR, no image
// content read, no pixel data touched.
const MARK_IMAGE_ELEMENT = mammoth.images.imgElement(async (element: { contentType: string }) => ({
  // No data-URI embedding — this engine never reads the image's real
  // pixel bytes, only its real presence and content-type, so `src` is
  // intentionally left empty rather than encoding the image data.
  src: '',
  'data-mammoth-image': 'true',
  'data-content-type': element.contentType,
}))

async function defaultConvertToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer }, { convertImage: MARK_IMAGE_ELEMENT })
  return result.value
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function parseListItems(html: string): readonly string[] {
  const items: string[] = []
  const itemPattern = /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi
  let match: RegExpExecArray | null
  while ((match = itemPattern.exec(html)) !== null) {
    const text = stripTags(match[1] ?? '')
    if (text.length > 0) items.push(text)
  }
  return items
}

function parseTableRows(html: string): readonly (readonly string[])[] {
  const rows: string[][] = []
  const rowPattern = /<tr(?:\s[^>]*)?>([\s\S]*?)<\/tr>/gi
  let rowMatch: RegExpExecArray | null
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const cells: string[] = []
    const cellPattern = /<t[dh](?:\s[^>]*)?>([\s\S]*?)<\/t[dh]>/gi
    let cellMatch: RegExpExecArray | null
    while ((cellMatch = cellPattern.exec(rowMatch[1] ?? '')) !== null) {
      cells.push(stripTags(cellMatch[1] ?? ''))
    }
    if (cells.length > 0) rows.push(cells)
  }
  return rows
}

// Sprint UCE-3A (additive) — the alternation's second branch matches the
// self-closing <img ... /> marker mammoth emits for each real embedded
// image (see MARK_IMAGE_ELEMENT above); its attributes land in group 3
// since it has no closing tag / inner content to capture in groups 1/2.
const BLOCK_PATTERN = /<(h[1-6]|p|ul|ol|table)(?:\s[^>]*)?>([\s\S]*?)<\/\1>|<img\s+([^>]*?)\/?>/gi

function attributeValue(attributes: string, name: string): string | null {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(attributes)
  return match?.[1] ?? null
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. A
// small, purpose-built block extractor scoped to mammoth's own
// predictable, flat HTML output (h1-h6/p/ul/ol/li/table/tr/td/img) —
// deliberately not a general HTML parser (would be a 3rd new dependency
// for a well-bounded, predictable input this codebase already controls
// one side of). Exported for direct unit testing, independent of mammoth
// itself.
export function parseDocxHtmlBlocks(html: string): readonly LearningContentBlock[] {
  const blocks: LearningContentBlock[] = []
  let match: RegExpExecArray | null
  BLOCK_PATTERN.lastIndex = 0
  while ((match = BLOCK_PATTERN.exec(html)) !== null) {
    const tag = match[1]
    const inner = match[2] ?? ''
    const imageAttributes = match[3]

    if (tag) {
      if (/^h[1-6]$/.test(tag)) {
        const text = stripTags(inner)
        if (text.length > 0) blocks.push({ type: 'heading', level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text })
      } else if (tag === 'p') {
        const text = stripTags(inner)
        if (text.length > 0) blocks.push({ type: 'paragraph', text })
      } else if (tag === 'ul' || tag === 'ol') {
        const items = parseListItems(inner)
        if (items.length > 0) blocks.push({ type: 'list', ordered: tag === 'ol', items })
      } else if (tag === 'table') {
        const rows = parseTableRows(inner)
        if (rows.length > 0) blocks.push({ type: 'table', rows })
      }
    } else if (imageAttributes !== undefined && /data-mammoth-image="true"/.test(imageAttributes)) {
      const contentType = attributeValue(imageAttributes, 'data-content-type') ?? 'application/octet-stream'
      const alt = attributeValue(imageAttributes, 'alt')
      blocks.push({ type: 'image', contentType, alt: alt && alt.length > 0 ? alt : null })
    }
  }
  return blocks
}

// Groups a flat block list into sections at each heading boundary.
// Content before the first heading (or a document with no headings at
// all) becomes one heading-less section, matching how a real document
// reads: introductions before the first titled section are still real
// content.
function groupIntoSections(blocks: readonly LearningContentBlock[]): readonly LearningSection[] {
  const sections: LearningSection[] = []
  let currentHeading: string | null = null
  let currentBlocks: LearningContentBlock[] = []
  let index = 0

  function flush(): void {
    if (currentBlocks.length > 0 || currentHeading !== null) {
      sections.push({ id: `section-${index}`, heading: currentHeading, blocks: currentBlocks })
      index += 1
    }
  }

  for (const block of blocks) {
    if (block.type === 'heading') {
      flush()
      currentHeading = block.text
      currentBlocks = []
    } else {
      currentBlocks.push(block)
    }
  }
  flush()

  return sections
}

function blocksToPlainParagraphs(blocks: readonly LearningContentBlock[]): readonly string[] {
  const paragraphs: string[] = []
  for (const block of blocks) {
    if (block.type === 'heading' || block.type === 'paragraph') {
      paragraphs.push(block.text)
    } else if (block.type === 'list') {
      paragraphs.push(...block.items)
    } else if (block.type === 'table') {
      paragraphs.push(...block.rows.map((row) => row.join(' | ')))
    }
  }
  return paragraphs
}

// Reuses mammoth (already a dependency for the wizard's DOCX readability
// check) via convertToHtml() — a second, real call site, not a duplicate
// of documentTextExtraction.ts's extractTextFromDocx (extractRawText),
// which discards structure entirely and stays exactly as-is for its own
// existing purpose.
export async function extractDOCX(file: File, source: UniversalSource, convertFn: ConvertDocxToHtmlFn = defaultConvertToHtml): Promise<ExtractionResult> {
  let html: string
  try {
    html = await convertFn(file)
  } catch {
    return { success: false, error: { code: 'corrupted-document', message: "We couldn't read this document. It may be corrupted or password-protected." } }
  }

  const blocks = parseDocxHtmlBlocks(html)
  if (blocks.length === 0) {
    return { success: false, error: { code: 'empty-extraction', message: "We couldn't find any content in this document." } }
  }

  const sections = groupIntoSections(blocks)
  const rawParagraphs = blocksToPlainParagraphs(blocks)
  const normalized = normalizeContent(rawParagraphs.join('\n\n'))

  const document = buildUniversalLearningDocument(source, source.name, sections, normalized.paragraphs, normalized.content, null)
  return { success: true, document }
}
