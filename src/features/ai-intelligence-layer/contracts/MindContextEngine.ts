import type { MindContext } from '../types'

// "Aggregate intelligence from the platform" — pure normalization, same
// as UserContextEngine: never queries a score itself, only defaults
// missing ones to `0` (never an invented positive number).
export interface MindContextEngine {
  buildContext(input: Partial<MindContext>): MindContext
}
