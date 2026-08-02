import type { LearningContentBlock } from '@/core/universal-learning-engine/extraction'

// Shared by builders/buildLearningChunk.ts (to assemble `content`) and
// validators/validateLearningChunk.ts (to verify `content` still matches
// `blocks`) — one real implementation, never two that could drift apart.
export function blockText(block: LearningContentBlock): string {
  switch (block.type) {
    case 'heading':
      return block.text
    case 'paragraph':
      return block.text
    case 'list':
      return block.items.join('\n')
    case 'table':
      return block.rows.map((row) => row.join(' | ')).join('\n')
    case 'image':
      // Presence-only, never OCR'd — no real text to contribute.
      return ''
  }
}

export function blocksToContent(blocks: readonly LearningContentBlock[]): string {
  return blocks.map(blockText).join('\n\n')
}
