import type { FormattedResponse, MarkdownBlock, PlainTextBlock, RawAIResponseInput, ResponseBlock } from '../types'
import type { ResponseFormatter } from '../contracts'

const MARKDOWN_INDICATOR_PATTERN = /[#*_`[\]]/
const BULLET_LINE_PATTERN = /^\s*[-*]\s+(.*)$/
const ACTION_LINE_PATTERN = /^\s*Action:\s*(.*)$/i

function classifyTextBlock(content: string): MarkdownBlock | PlainTextBlock {
  return MARKDOWN_INDICATOR_PATTERN.test(content) ? { type: 'markdown', content } : { type: 'plain-text', content }
}

function extractByLinePattern(content: string, pattern: RegExp): readonly string[] {
  const matches: string[] = []
  for (const line of content.split('\n')) {
    const match = pattern.exec(line)
    if (match?.[1] !== undefined) matches.push(match[1].trim())
  }
  return matches
}

// Implements ResponseFormatter. Deterministic text classification only
// — no LLM call, no fuzzy matching: (1) the raw content itself becomes
// exactly one markdown-or-plain-text block, classified by whether it
// contains any markdown syntax; (2) any `- `/`* ` lines become a
// bullet-list block; (3) any `Action: ...` lines become action-item
// blocks; (4) `cards`/`suggestedExerciseIds` (structured extras a
// provider could attach) pass through 1:1, never parsed out of free
// text. "No invented data" — a SuggestedExerciseBlock carries only the
// id it was given.
export class DefaultResponseFormatter implements ResponseFormatter {
  format(raw: RawAIResponseInput): FormattedResponse {
    const blocks: ResponseBlock[] = [classifyTextBlock(raw.content)]

    const bulletItems = extractByLinePattern(raw.content, BULLET_LINE_PATTERN)
    if (bulletItems.length > 0) {
      blocks.push({ type: 'bullet-list', items: bulletItems })
    }

    for (const label of extractByLinePattern(raw.content, ACTION_LINE_PATTERN)) {
      blocks.push({ type: 'action-item', label })
    }

    for (const card of raw.cards ?? []) {
      blocks.push({ type: 'card', title: card.title, body: card.body })
    }

    for (const exerciseId of raw.suggestedExerciseIds ?? []) {
      blocks.push({ type: 'suggested-exercise', exerciseId })
    }

    return { blocks }
  }
}

export function createResponseFormatter(): ResponseFormatter {
  return new DefaultResponseFormatter()
}
