import type { PerformanceSignal } from '../types/PerformanceSignal'

export type PerformanceSignalListener = (signal: PerformanceSignal) => void

// Learning Intelligence Engine™ — the real performance-signal pipeline.
// Mirrors `src/core/learning-mode-integration/dispatchRuntimeEvents.ts`'s
// exact real dispatch-to-registered-listener shape (a mode/domain with
// no listener registered is a real, honest no-op, never an error) —
// generalized here to plain listener functions instead of a single
// mode's `RuntimeModeAdapter`, since this pipeline can have more than
// one real subscriber (the `LearningIntelligenceEngine` today; a future
// analytics or gamification listener tomorrow, added here without
// touching any stage component that already calls `dispatchPerformanceSignal`).
export function dispatchPerformanceSignal(listeners: readonly PerformanceSignalListener[], signal: PerformanceSignal): void {
  for (const listener of listeners) listener(signal)
}
