import type { AIRequest } from '@/features/ai-provider/types'
import type { ProviderExecutionOptions } from '../types'

// The genuine AI Provider Layer™ integration seam: proves
// `ProviderExecutionOptions` is shaped exactly like `AIRequest`'s own
// optional `temperature`/`maxOutputTokens` fields — same "not
// runtime-wired, a compile-time compatibility proof" framing as
// `provider-translation-engine/integration/PROVIDER_ROLE_MAP.ts`. Not
// called anywhere else in this feature — this engine never produces an
// `AIRequest` itself.
export function toAIRequestOptions(options: ProviderExecutionOptions): Pick<AIRequest, 'temperature' | 'maxOutputTokens'> {
  return { temperature: options.temperature, maxOutputTokens: options.maxOutputTokens }
}
