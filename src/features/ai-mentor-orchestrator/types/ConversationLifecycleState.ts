// The Sprint 11 brief's own Lifecycle list, verbatim. See
// lifecycle/DefaultConversationLifecycleManager.ts for the exact legal
// transition graph.
export type ConversationLifecycleState = 'queued' | 'ready' | 'running' | 'waiting' | 'completed' | 'dismissed' | 'expired'
