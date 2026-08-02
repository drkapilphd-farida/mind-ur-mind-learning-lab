import type { ConversationType } from './ConversationType'
import type { MentorTone } from './MentorTone'

export type ConversationMetadata = {
  conversationType: ConversationType
  tone: MentorTone
  generatedAt: string
}
