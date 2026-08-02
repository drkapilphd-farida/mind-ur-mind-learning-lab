// Quantum Speed Reading Experience Engine™ (QSR-E1) — Smart Chunk
// Reading™. Pure, deterministic — splits a real chunk's own real
// `content` into smaller "natural reading groups" for presentation only.
// Never summarizes, never rewrites, never drops a single real word — the
// brief's own first principle ("AI transforms HOW the learner reads, AI
// never changes WHAT the learner studies") applies here literally: this
// function's output, rejoined with spaces, reconstructs the real input
// content exactly.
//
// Sentence boundaries are respected wherever possible (a group only ever
// grows past the target word count to finish a sentence already in
// progress, never split mid-sentence) — natural reading groups, not an
// arbitrary word-count guillotine.
const DEFAULT_TARGET_WORDS_PER_GROUP = 15

function splitIntoSentences(content: string): readonly string[] {
  return content
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function splitIntoReadingGroups(content: string, targetWordsPerGroup: number = DEFAULT_TARGET_WORDS_PER_GROUP): readonly string[] {
  const trimmed = content.trim()
  if (trimmed.length === 0) return []

  const sentences = splitIntoSentences(trimmed)
  const groups: string[] = []
  let current: string[] = []
  let currentWordCount = 0

  for (const sentence of sentences) {
    const wordCount = countWords(sentence)
    if (currentWordCount > 0 && currentWordCount + wordCount > targetWordsPerGroup) {
      groups.push(current.join(' '))
      current = []
      currentWordCount = 0
    }
    current.push(sentence)
    currentWordCount += wordCount
  }

  if (current.length > 0) groups.push(current.join(' '))

  return groups
}
