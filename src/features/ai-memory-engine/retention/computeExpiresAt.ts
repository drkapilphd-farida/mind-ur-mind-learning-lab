import type { MemoryRetention } from '../types'

// TTL per retention policy — `permanent` never expires (`null`).
// `session` is deliberately short (this feature has no real "session
// ended" event to key off yet — "Architecture only" — so it degrades
// to a conservative few-hour window).
const TTL_HOURS_BY_RETENTION: Record<Exclude<MemoryRetention, 'permanent'>, number> = {
  session: 4,
  daily: 24,
  weekly: 168,
  monthly: 720,
}

export function computeExpiresAt(createdAt: string, retention: MemoryRetention): string | null {
  if (retention === 'permanent') return null
  const ttlHours = TTL_HOURS_BY_RETENTION[retention]
  return new Date(new Date(createdAt).getTime() + ttlHours * 60 * 60 * 1000).toISOString()
}
