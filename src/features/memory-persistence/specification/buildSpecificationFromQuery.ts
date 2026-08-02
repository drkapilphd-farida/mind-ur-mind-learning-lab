import type { MemoryQuery } from '../query'
import type { MemorySpecification } from './MemorySpecification'
import { createCombinedSpecification } from './createCombinedSpecification'
import { createTypeSpecification } from './createTypeSpecification'
import { createImportanceSpecification } from './createImportanceSpecification'
import { createLifecycleSpecification } from './createLifecycleSpecification'
import { createDateRangeSpecification } from './createDateRangeSpecification'
import { createTagSpecification } from './createTagSpecification'
import { createConversationSpecification } from './createConversationSpecification'

// Translates a MemoryQuery's filter fields (everything except
// `userId`/`limit`/`offset`/`sortField`/`sortDirection`, which aren't
// specification concerns) into one combined specification — only a
// non-null field contributes a specification, so an all-null query
// (aside from `userId`) matches everything for that user.
export function buildSpecificationFromQuery(query: MemoryQuery): MemorySpecification {
  const specifications: MemorySpecification[] = []

  if (query.type !== null) specifications.push(createTypeSpecification(query.type))
  if (query.lifecycle !== null) specifications.push(createLifecycleSpecification(query.lifecycle))
  if (query.importance !== null) specifications.push(createImportanceSpecification(query.importance))
  if (query.dateRange !== null) specifications.push(createDateRangeSpecification(query.dateRange))
  if (query.tags !== null) specifications.push(createTagSpecification(query.tags))
  if (query.conversationId !== null) specifications.push(createConversationSpecification(query.conversationId))

  return createCombinedSpecification(specifications)
}
