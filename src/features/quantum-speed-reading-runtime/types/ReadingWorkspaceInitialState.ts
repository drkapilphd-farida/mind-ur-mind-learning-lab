// Quantum Speed Reading™ Production Sprint-2, refactored during Memory
// Mode™ Sprint-2's shared-extraction. The real shape now lives in the
// Shared Learning Runtime (`src/features/learning-mode-runtime/`), since
// it was already fully mode-agnostic. This re-export preserves QSR's own
// name and import path exactly — every existing consumer keeps working
// unchanged.
export type { ModeWorkspaceInitialState as ReadingWorkspaceInitialState } from '@/features/learning-mode-runtime/types/ModeWorkspaceInitialState'
