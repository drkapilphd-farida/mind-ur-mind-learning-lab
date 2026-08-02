import type { MemoryImportance, MemoryLifecycleState } from '../domain'

// The Sprint 19 brief's own 6 policy-evaluation criteria (Section 2),
// verbatim: "Memory lifecycle state, Age, Importance, Tags,
// Conversation association, Explicit pin status." A discriminated
// union — each variant is one composable, pure predicate; a
// `MemoryRetentionPolicy` combines any number of these with AND
// semantics (see `retentionPolicyEngine/evaluateRetentionPolicy.ts`).
// `conversation` reuses the exact same tag-convention Sprint 14
// established (`specification/createConversationSpecification.ts`) —
// this domain still has no dedicated `conversationId` field.
export type RetentionRule =
  | { readonly type: 'lifecycle-state'; readonly states: readonly MemoryLifecycleState[] }
  | { readonly type: 'max-age-days'; readonly maxAgeDays: number }
  | { readonly type: 'importance'; readonly importances: readonly MemoryImportance[] }
  | { readonly type: 'tag'; readonly tags: readonly string[] }
  | { readonly type: 'conversation'; readonly conversationId: string }
  | { readonly type: 'pinned'; readonly pinned: boolean }
