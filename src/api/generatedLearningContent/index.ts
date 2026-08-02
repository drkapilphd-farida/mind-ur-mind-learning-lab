// External contract for the `generatedLearningContent` domain — thin by
// design (see docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/generatedLearningContent/ and does nothing else.

export { getGeneratedLearningContent, saveGeneratedLearningContent } from '@/services/generatedLearningContent'
export type { GeneratedLearningContentModeId } from '@/services/generatedLearningContent'
