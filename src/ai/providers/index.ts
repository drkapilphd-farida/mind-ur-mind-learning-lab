// Provider adapters — one file per AI provider, each implementing
// `AIProvider` from `../types`. No API keys, no SDK calls yet: the
// existing, working Anthropic integration
// (src/features/ai-tutor/actions/chat.ts,
// src/features/admin/actions/generateLessonContent.ts) is untouched and
// keeps serving Brain Training Studio™; this is where a future *unified*
// provider layer for AI Learning Studio™ will live once built.

import { NotImplementedError } from '@/lib/errors'
import type { AIProvider } from '../types'

export const anthropicProvider: AIProvider = {
  id: 'anthropic',
  generate() {
    throw new NotImplementedError('anthropicProvider.generate — AI Learning Studio™ AI integration sprint')
  },
}

export const AI_PROVIDERS: readonly AIProvider[] = [anthropicProvider]
