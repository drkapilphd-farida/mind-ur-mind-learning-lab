import type { AIModelCapabilities } from './AIModelCapabilities'

export type AIModel = {
  id: string
  displayName: string
  providerId: string
  capabilities: AIModelCapabilities
  contextWindowTokens: number
  maxOutputTokens: number
}
