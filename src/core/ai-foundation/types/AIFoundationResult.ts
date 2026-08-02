import type { AIError, AIResponse, AIUsage } from '@/features/ai-provider/types'
import type { AITask } from './AITask'

// AI Foundation Layer™ — AIF-1. Plain data, not a thrown Error — same
// Result-type convention used everywhere in this codebase
// (ExtractionResult, UniversalUploadError, ...). A caller never needs a
// try/catch to handle a provider failure; it checks `.success`.
export type AIFoundationSuccessResult = {
  success: true
  task: AITask
  requestId: string
  response: AIResponse
  usage: AIUsage
  cacheHit: boolean
  processingTimeMs: number
}

export type AIFoundationFailureResult = {
  success: false
  task: AITask
  requestId: string
  error: AIError
  processingTimeMs: number
}

export type AIFoundationResult = AIFoundationSuccessResult | AIFoundationFailureResult
