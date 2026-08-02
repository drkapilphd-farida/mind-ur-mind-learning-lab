import type { RawUsagePayload, ResponseUsage } from '../types'

// One of the brief's own 10 named responsibilities.
export interface UsageExtractor {
  extract(raw: RawUsagePayload | null): ResponseUsage
}
