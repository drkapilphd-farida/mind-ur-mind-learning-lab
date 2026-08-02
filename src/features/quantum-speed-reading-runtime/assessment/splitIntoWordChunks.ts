// Reading Assessment Engine™ — Word Chunk stage's own splitter.
// `splitIntoReadingGroups` (the Smart Chunk Reading engine this feature
// otherwise reuses) deliberately never breaks mid-sentence — but Word
// Chunk stage needs the opposite: tiny, fixed-size word groups
// regardless of sentence boundaries, the raw word-group-recognition unit
// this stage actually measures. Pure, deterministic, never drops or
// reorders a single real word.
export function splitIntoWordChunks(content: string, wordsPerChunk: number): readonly string[] {
  const words = content.trim().split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  for (let index = 0; index < words.length; index += wordsPerChunk) {
    chunks.push(words.slice(index, index + wordsPerChunk).join(' '))
  }
  return chunks
}
