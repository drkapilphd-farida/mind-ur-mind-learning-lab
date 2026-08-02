import type { ConversationRule } from '../types'

// One rule per Supported Trigger, mapping it to the Sprint 10
// ConversationType it should dispatch and the priority it dispatches
// at. Priorities reflect genuine urgency: a long-inactivity nudge and
// a first-ever welcome are time-sensitive (critical); a post-exercise
// suggestion can wait (background).
export const CONVERSATION_RULES: readonly ConversationRule[] = [
  { id: 'rule-mind-passport-created', trigger: 'mind-passport-created', conversationType: 'welcome', priority: 'critical' },
  { id: 'rule-long-inactivity', trigger: 'long-inactivity', conversationType: 'study-reminder', priority: 'critical' },
  { id: 'rule-weak-performance', trigger: 'weak-performance', conversationType: 'weakness-coaching', priority: 'high' },
  { id: 'rule-assessment-completed', trigger: 'assessment-completed', conversationType: 'learning-plan-explanation', priority: 'high' },
  { id: 'rule-journey-completed', trigger: 'journey-completed', conversationType: 'milestone-conversation', priority: 'high' },
  { id: 'rule-milestone-achieved', trigger: 'milestone-achieved', conversationType: 'milestone-conversation', priority: 'high' },
  { id: 'rule-journey-started', trigger: 'journey-started', conversationType: 'journey-guidance', priority: 'medium' },
  { id: 'rule-high-performance', trigger: 'high-performance', conversationType: 'progress-celebration', priority: 'medium' },
  { id: 'rule-daily-login', trigger: 'daily-login', conversationType: 'daily-motivation', priority: 'low' },
  { id: 'rule-exercise-completed', trigger: 'exercise-completed', conversationType: 'next-session-suggestion', priority: 'background' },
] as const
