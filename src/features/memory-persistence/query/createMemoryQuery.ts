import type { MemoryQuery } from './MemoryQuery'

export type CreateMemoryQueryInput = {
  userId: string
  type?: MemoryQuery['type']
  lifecycle?: MemoryQuery['lifecycle']
  importance?: MemoryQuery['importance']
  dateRange?: MemoryQuery['dateRange']
  tags?: MemoryQuery['tags']
  conversationId?: MemoryQuery['conversationId']
  limit?: MemoryQuery['limit']
  offset?: number
  sortField?: MemoryQuery['sortField']
  sortDirection?: MemoryQuery['sortDirection']
}

// Builds a complete, valid-shaped MemoryQuery from just `userId`,
// filling in every other field's default — same "builder fills in
// defaults" convention as
// `@/features/ai-provider/configuration/createProviderConfiguration.ts`
// (Sprint 5).
export function createMemoryQuery(input: CreateMemoryQueryInput): MemoryQuery {
  return {
    userId: input.userId,
    type: input.type ?? null,
    lifecycle: input.lifecycle ?? null,
    importance: input.importance ?? null,
    dateRange: input.dateRange ?? null,
    tags: input.tags ?? null,
    conversationId: input.conversationId ?? null,
    limit: input.limit ?? null,
    offset: input.offset ?? 0,
    sortField: input.sortField ?? 'createdAt',
    sortDirection: input.sortDirection ?? 'descending',
  }
}
