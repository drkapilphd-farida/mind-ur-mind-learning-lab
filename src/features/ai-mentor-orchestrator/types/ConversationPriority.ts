// Ordered highest to lowest — ConversationQueueManager sorts by this
// exact order, never a re-derived numeric mapping duplicated elsewhere.
export type ConversationPriority = 'critical' | 'high' | 'medium' | 'low' | 'background'
