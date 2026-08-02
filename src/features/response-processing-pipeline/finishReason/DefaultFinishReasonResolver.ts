import type { FinishReason } from '../types'
import type { FinishReasonResolver } from './FinishReasonResolver'

const KNOWN_FINISH_REASONS: Record<string, FinishReason> = {
  stop: 'stop',
  length: 'length',
  content_filter: 'content-filter',
  error: 'error',
}

export class DefaultFinishReasonResolver implements FinishReasonResolver {
  resolve(raw: string | null): FinishReason {
    if (raw === null) return 'unknown'
    return KNOWN_FINISH_REASONS[raw] ?? 'unknown'
  }
}

export function createFinishReasonResolver(): FinishReasonResolver {
  return new DefaultFinishReasonResolver()
}
