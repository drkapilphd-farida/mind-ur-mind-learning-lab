// A rough, deterministic proxy for token count — ~4 characters per
// token is a commonly-cited approximation for English text, not a
// real tokenizer (no tiktoken/SentencePiece dependency — "NO network
// requests" extends to not needing one). Shared by generate() and
// estimateCost() so the two never quietly disagree on how many tokens
// a given piece of text represents.
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4))
}
