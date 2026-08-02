import type { ConversationPriority } from '../types'

// How long an unacted-on conversation stays valid before
// ConversationLifecycleManager.expireIfStale() expires it. More urgent
// priorities expire *sooner* — a stale "critical" nudge is more
// misleading to still show than a stale "background" suggestion.
const TTL_HOURS_BY_PRIORITY: Record<ConversationPriority, number> = {
  critical: 24,
  high: 48,
  medium: 72,
  low: 96,
  background: 168,
}

export function computeExpiresAt(occurredAt: string, priority: ConversationPriority): string {
  const ttlHours = TTL_HOURS_BY_PRIORITY[priority]
  return new Date(new Date(occurredAt).getTime() + ttlHours * 60 * 60 * 1000).toISOString()
}
