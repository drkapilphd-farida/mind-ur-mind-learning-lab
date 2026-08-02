import type { DifficultyTier } from '@/types/exercise-engine'

// AI Generated Dynamic Content™ — Sprint-1 architecture only ("every
// session should feel unique... generate dynamically"). This is the one
// seam a future Claude-backed provider implements and swaps in behind,
// without any calling stage component changing. Generic over each
// domain's own real content shape — Reading/Memory/Focus each already
// have a differently-shaped content loader (see `loadContent.ts` and its
// siblings), and this interface doesn't force them into one artificial
// shared shape.
export type ContentProvider<TContent> = {
  getContent: (tier: DifficultyTier) => TContent
}
