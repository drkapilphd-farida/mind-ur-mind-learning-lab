const DEFAULT_MAX_EXCERPT_LENGTH = 600

export type ContentExcerpt = { text: string; isExcerpt: boolean }

// Shared Learning Modes helper — Sprint ALS-17 extraction. Moved from
// Flashcards™'s own private `excerptOf` (ALS-13) — a real, bounded
// excerpt of real content, never invented text. Breaks at the nearest
// real word boundary rather than mid-word, and is honest about being an
// excerpt via the returned `isExcerpt` flag rather than silently
// presenting a cut-off sentence as the whole section. `maxLength` is
// configurable (Flashcards™'s own review-card back keeps its original
// 600-character default; MCQs™ (ALS-17) uses a shorter one for its own
// real excerpt-based structural questions) — reused rather than a
// second, duplicate implementation, per this sprint's own "do not
// duplicate parsing" rule.
export function excerptContent(content: string, maxLength: number = DEFAULT_MAX_EXCERPT_LENGTH): ContentExcerpt {
  const trimmed = content.trim()
  if (trimmed.length <= maxLength) return { text: trimmed, isExcerpt: false }

  const cut = trimmed.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  const text = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()
  return { text: `${text}…`, isExcerpt: true }
}
