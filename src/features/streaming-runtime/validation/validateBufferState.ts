import type { StreamBufferPolicy, StreamBufferState, StreamingValidation, StreamingValidationIssue } from '../types'

// Pure — "Buffer overflow" (§ brief).
export function validateBufferState(state: StreamBufferState, policy: StreamBufferPolicy): StreamingValidation {
  const issues: StreamingValidationIssue[] = []

  if (state.chunks.length > policy.maxBufferedChunks) {
    issues.push({
      type: 'buffer-overflow',
      detail: `Buffered chunk count ${state.chunks.length} exceeds the policy limit of ${policy.maxBufferedChunks}.`,
    })
  }

  if (state.totalContentLength > policy.maxBufferedContentLength) {
    issues.push({
      type: 'buffer-overflow',
      detail: `Buffered content length ${state.totalContentLength} exceeds the policy limit of ${policy.maxBufferedContentLength}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
