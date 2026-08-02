import type { IndexType } from '../indexDomain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'
import { extractMemoryIdKey } from './extractMemoryIdKey'
import { extractUserIdKey } from './extractUserIdKey'
import { extractConversationIdKeys } from './extractConversationIdKeys'
import { extractTypeKey } from './extractTypeKey'
import { extractLifecycleStateKey } from './extractLifecycleStateKey'
import { extractImportanceKey } from './extractImportanceKey'
import { extractTagKeys } from './extractTagKeys'
import { extractCreatedAtKey } from './extractCreatedAtKey'
import { extractUpdatedAtKey } from './extractUpdatedAtKey'

// The one place every built-in `IndexType` is wired to its
// deterministic key-extraction function — `indexMaintenance/` and
// `indexValidation/` both read from this map rather than
// hard-coding a switch each, so adding a 10th built-in index type is a
// one-line change here.
export const BUILTIN_INDEX_KEY_EXTRACTORS: Record<IndexType, IndexKeyExtractor> = {
  memoryId: extractMemoryIdKey,
  userId: extractUserIdKey,
  conversationId: extractConversationIdKeys,
  type: extractTypeKey,
  lifecycleState: extractLifecycleStateKey,
  importance: extractImportanceKey,
  tag: extractTagKeys,
  createdAt: extractCreatedAtKey,
  updatedAt: extractUpdatedAtKey,
}

export const BUILTIN_INDEX_TYPES: readonly IndexType[] = Object.keys(BUILTIN_INDEX_KEY_EXTRACTORS) as IndexType[]
