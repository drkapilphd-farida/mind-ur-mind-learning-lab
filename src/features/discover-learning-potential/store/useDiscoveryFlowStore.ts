import { create } from 'zustand'
import type { DiscoveryStageId } from '../types/DiscoveryStageId'
import type { LearnerType } from '../types/LearnerContext'
import type { PerformanceSignal } from '../types/PerformanceSignal'

type DiscoveryFlowState = {
  currentStage: DiscoveryStageId
  learnerType: LearnerType | null
  signals: readonly PerformanceSignal[]
  setStage: (stage: DiscoveryStageId) => void
  setLearnerType: (learnerType: LearnerType) => void
  recordSignal: (signal: PerformanceSignal) => void
  reset: () => void
}

const INITIAL_STATE = {
  currentStage: 'welcome' as DiscoveryStageId,
  learnerType: null as LearnerType | null,
  signals: [] as readonly PerformanceSignal[],
}

// State management — the first real Zustand store in this codebase
// (`zustand` is a declared dependency per this project's own CLAUDE.md
// stack, with zero existing stores to date — confirmed by search). Holds
// exactly the real, cross-screen state the locked 6-screen flow needs:
// which stage is active, the real "Myself/My Child" selection (never
// persisted to the dormant `families` tables in Sprint-1 — see
// `LearnerContext.ts`), and the accumulated real `PerformanceSignal[]`
// a future sprint's stage components record through
// `dispatchPerformanceSignal`. Never session/runtime data, never sent to
// a Server Action directly — the `*_discovery_sessions` tables remain
// the durable record.
export const useDiscoveryFlowStore = create<DiscoveryFlowState>((set) => ({
  ...INITIAL_STATE,
  setStage: (stage) => set({ currentStage: stage }),
  setLearnerType: (learnerType) => set({ learnerType }),
  recordSignal: (signal) => set((state) => ({ signals: [...state.signals, signal] })),
  reset: () => set(INITIAL_STATE),
}))
