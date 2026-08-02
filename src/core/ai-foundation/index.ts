// AI Foundation Layer™ — AIF-1. The one import path every future engine
// (UCE-3B onward) and every AI-adjacent feature uses. "This layer
// becomes the ONLY gateway to every AI provider" — no engine should
// import @/features/ai-provider, @/features/real-ai-providers,
// @anthropic-ai/sdk, or openai directly; everything needed is re-exported
// from here.
//
//   const foundation = createAIFoundation()
//   const result = await foundation.execute('summarization', { messages: [...] })
//
// `execute()` never knows or cares which provider answered.

export { createAIFoundation } from './aiFoundation'
export type { AIFoundation, AIFoundationDependencies } from './aiFoundation'

export * from './types'

export { runWithConcurrency } from './runWithConcurrency'
export { withExecuteTimeout } from './withExecuteTimeout'
