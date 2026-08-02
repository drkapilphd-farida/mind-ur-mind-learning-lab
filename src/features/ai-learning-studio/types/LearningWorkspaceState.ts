// AI Learning Studio™ Sprint ALS-5 — the universal Learning Workspace™'s
// own state model, deliberately a superset of the existing
// `ModeWorkspaceInitialState` (learning-mode-runtime): every real Learning
// Mode's own workspace route already resolves to 'not-processed' |
// 'not-started' | 'in-progress' | 'error'. This container adds exactly
// one more, honest state — 'unavailable' — for a real, listed Learning
// Mode (Revision, Research, Exam Prep, ...) that has no real session
// runtime behind it yet. Never silently coerced into 'not-started'.
export type LearningWorkspaceState =
  | { kind: 'unavailable' }
  | { kind: 'not-processed' }
  | { kind: 'not-started' }
  | {
      kind: 'in-progress'
      completionPercentage: number
      completedChunks: number
      totalChunks: number
      estimatedTimeLeftSeconds: number
      startedAt: string | null
      didResume: boolean
    }
  | { kind: 'error'; message: string }
