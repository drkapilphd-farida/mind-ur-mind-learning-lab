import type { LearningContentBlock, LearningSection } from '@/core/universal-learning-engine/extraction'
import type { ReadingChunk } from '../types/ReadingChunk'

// Disclosed, adjustable default — the same "named constant, not a hidden
// magic number" convention as the 200 WPM reading-speed assumption
// already established elsewhere in this arc (generateReadingPassage.ts,
// computeReadability.ts).
export const DEFAULT_TARGET_WORDS_PER_CHUNK = 200

function countBlockWords(block: LearningContentBlock): number {
  function wordsIn(text: string): number {
    const trimmed = text.trim()
    return trimmed.length > 0 ? trimmed.split(/\s+/).length : 0
  }

  switch (block.type) {
    case 'heading':
    case 'paragraph':
      return wordsIn(block.text)
    case 'list':
      return block.items.reduce((sum, item) => sum + wordsIn(item), 0)
    case 'table':
      return block.rows.reduce((sum, row) => sum + row.reduce((rowSum, cell) => rowSum + wordsIn(cell), 0), 0)
    case 'image':
      return 0
    default:
      return 0
  }
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-3A. Pure,
// deterministic: walks each section's blocks in real reading order,
// starting a new chunk at every section boundary (a section is already a
// real, authored structural unit — see extractDOCX.ts's groupIntoSections
// / extractPDF.ts's one-section-per-page) and whenever the running word
// count within a section crosses `targetWordsPerChunk` at a safe block
// boundary — never mid-block. A table or image is never split across
// chunks, even if it alone pushes a chunk over the target.
export function chunkSections(documentId: string, sections: readonly LearningSection[], targetWordsPerChunk = DEFAULT_TARGET_WORDS_PER_CHUNK): readonly ReadingChunk[] {
  const chunks: ReadingChunk[] = []
  let order = 0

  function pushChunk(section: LearningSection, blocks: readonly LearningContentBlock[]): void {
    if (blocks.length === 0) return
    chunks.push({
      id: `chunk-${order}`,
      documentId,
      order,
      heading: section.heading,
      sectionId: section.id,
      blocks,
      wordCount: blocks.reduce((sum, block) => sum + countBlockWords(block), 0),
      hasTable: blocks.some((block) => block.type === 'table'),
      hasImage: blocks.some((block) => block.type === 'image'),
    })
    order += 1
  }

  for (const section of sections) {
    let currentBlocks: LearningContentBlock[] = []
    let currentWords = 0

    for (const block of section.blocks) {
      const blockWords = countBlockWords(block)
      if (currentBlocks.length > 0 && currentWords + blockWords > targetWordsPerChunk) {
        pushChunk(section, currentBlocks)
        currentBlocks = []
        currentWords = 0
      }
      currentBlocks.push(block)
      currentWords += blockWords
    }
    pushChunk(section, currentBlocks)
  }

  return chunks
}
