import type { Memory, MemoryId } from '../domain'

// "Support atomic execution of: Create multiple memories, Update
// multiple memories, Archive multiple memories, Delete multiple
// memories." A discriminated union — each variant carries exactly what
// `batchOperations/DefaultBatchMemoryOperationExecutor.ts` needs to
// apply it, and what `rollbackEngine/` needs to identify which memory
// id it touches. `create`/`update` carry the full `Memory` (the
// caller's intent, already fully formed); `archive`/`delete` carry
// only the target id (this feature's lifecycle/repository
// machinery derives the rest).
export type TransactionOperation =
  | { readonly type: 'create'; readonly memory: Memory }
  | { readonly type: 'update'; readonly memory: Memory }
  | { readonly type: 'archive'; readonly memoryId: MemoryId }
  | { readonly type: 'delete'; readonly memoryId: MemoryId }
