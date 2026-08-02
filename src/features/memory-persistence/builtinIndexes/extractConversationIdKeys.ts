import type { IndexKeyExtractor } from './IndexKeyExtractor'
import { extractTagKeys } from './extractTagKeys'

// Sprint 13's `Memory` model has no dedicated `conversationId` field.
// Per the exact same documented convention introduced in Sprint 14
// (`specification/createConversationSpecification.ts`) — a
// conversation-scoped memory carries its conversation id as one of
// `Memory.metadata.tags` — this index shares its underlying data
// source with the `tag` index (see `extractTagKeys.ts`) until a future
// sprint adds a real `conversationId` field to the domain model, at
// which point only this one function needs to change.
export const extractConversationIdKeys: IndexKeyExtractor = extractTagKeys
