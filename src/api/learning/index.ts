// External contract for the `learning` domain — thin by design (see
// docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/learning/ and does nothing else.

export { listLearningProjects, getLearningProject, createLearningProject, startLearningSession, getDailyInsight } from '@/services/learning'
export type { CreateLearningProjectInput, StartLearningSessionInput } from '@/services/learning'
