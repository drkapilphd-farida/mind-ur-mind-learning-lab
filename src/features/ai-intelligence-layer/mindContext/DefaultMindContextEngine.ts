import type { MindContext } from '../types'
import type { MindContextEngine } from '../contracts'

// Implements MindContextEngine. Every score/metric defaults to `0` —
// never an invented positive number ("No hallucinated scores").
export class DefaultMindContextEngine implements MindContextEngine {
  buildContext(input: Partial<MindContext>): MindContext {
    return {
      mindScore: input.mindScore ?? 0,
      readingScore: input.readingScore ?? 0,
      memoryScore: input.memoryScore ?? 0,
      focusScore: input.focusScore ?? 0,
      visualIntelligenceScore: input.visualIntelligenceScore ?? 0,
      consistency: input.consistency ?? 0,
      xp: input.xp ?? 0,
      streak: input.streak ?? 0,
      currentProgress: input.currentProgress ?? 0,
    }
  }
}

export function createMindContextEngine(): MindContextEngine {
  return new DefaultMindContextEngine()
}
