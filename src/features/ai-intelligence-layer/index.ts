// AI Intelligence Layer™ (Sprint 7) — the Learning Mentor layer between
// the Learning Platform and every future AI Provider. Fully
// self-contained, mock/deterministic throughout — no network, no SDK,
// no real provider call anywhere in this feature.

export * from './types'
export * from './contracts'
export * from './userContext'
export * from './mindContext'
export * from './journeyContext'
export * from './conversationContext'
export * from './mentorPersona'
export * from './safetyRules'
export * from './promptComposition'
export * from './responseFormatter'
export { createAIIntelligenceLayer, type AIIntelligenceLayer, type AIIntelligenceLayerDependencies, type BuildPromptPackageInput } from './createAIIntelligenceLayer'
