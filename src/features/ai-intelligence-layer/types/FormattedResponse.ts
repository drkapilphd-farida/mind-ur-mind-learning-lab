import type { ResponseBlock } from './ResponseBlock'

// The one common structure every provider response normalizes into —
// "Normalize every provider response into one common structure."
export type FormattedResponse = {
  blocks: readonly ResponseBlock[]
}
