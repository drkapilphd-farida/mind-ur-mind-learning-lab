import type { RawUsagePayload, ResponseUsage } from '../types'
import type { UsageExtractor } from './UsageExtractor'

export class DefaultUsageExtractor implements UsageExtractor {
  extract(raw: RawUsagePayload | null): ResponseUsage {
    if (raw === null) return { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    return { promptTokens: raw.promptTokens, completionTokens: raw.completionTokens, totalTokens: raw.totalTokens }
  }
}

export function createUsageExtractor(): UsageExtractor {
  return new DefaultUsageExtractor()
}
