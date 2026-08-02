import type { ConversationType, MentorTone } from '../types'

// The deterministic mapping every PromptComposer implementation uses —
// "mentor tone" is a function of ConversationType, never chosen
// randomly or left to a caller to pick per-call.
export const TONE_BY_CONVERSATION_TYPE: Record<ConversationType, MentorTone> = {
  welcome: 'warm',
  'daily-motivation': 'motivating',
  'learning-plan-explanation': 'neutral',
  'exercise-recommendation': 'direct',
  'study-reminder': 'direct',
  'progress-celebration': 'celebratory',
  'weakness-coaching': 'reassuring',
  'milestone-conversation': 'celebratory',
  'journey-guidance': 'neutral',
  'next-session-suggestion': 'motivating',
}
