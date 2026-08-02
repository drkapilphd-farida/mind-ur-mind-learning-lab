import type { LearningMode } from '@/core/learning-mode-integration'

// Quantum Speed Reading™ — Production Sprint-1. The first real,
// registrable Learning Mode™, built against the locked Learning Mode
// Runtime Contract™ (LSE-5). No `adapter` is registered this sprint —
// Sprint-1 delivers only session lifecycle, navigation, progress, and
// persistence; presentation-layer concerns (pacing, attention, focus,
// recall hooks) are explicitly out of this sprint's scope and remain
// reserved, unimplemented extension points on `RuntimeModeAdapter` for a
// future sprint — exactly the "adapter is optional" case the Learning
// Mode Runtime Contract™ §2 anticipated, not an oversight.
export const quantumSpeedReadingMode: LearningMode = {
  type: 'quantum-speed-reading',
  capabilities: {
    sessionType: 'reading',
    supportedChunkStrategies: ['sequential', 'priority-first', 'dependency-first', 'review-first', 'adaptive-queue'],
    supportsCheckpoints: true,
  },
}
