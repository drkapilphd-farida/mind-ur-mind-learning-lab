import type { TokenUsage } from './TokenUsage'

export type AIFinishReason = 'stop' | 'length' | 'tool-call' | 'content-filter'

export type AIResponse = {
  id: string
  providerId: string
  modelId: string
  content: string
  usage: TokenUsage
  finishReason: AIFinishReason
}
