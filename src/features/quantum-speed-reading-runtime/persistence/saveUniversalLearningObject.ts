// Quantum Speed Reading™ Production Sprint-1, refactored during Memory
// Mode™ Sprint-1's shared-extraction. The real implementation now lives
// in the Shared Learning Runtime (`src/features/learning-mode-runtime/`),
// since saving a ULO was already fully mode-agnostic. This re-export
// preserves QSR's own name and import path exactly.
export { saveUniversalLearningObject } from '@/features/learning-mode-runtime/persistence/saveUniversalLearningObject'
