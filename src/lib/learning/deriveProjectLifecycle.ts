import type { ProjectLifecycleStageState } from '@/types/learning/lifecycle'

// The Learning Blueprint™ page only ever renders once a Document has
// reached 'ready' (src/app/preview/learning-projects/[id]/page.tsx
// redirects everything else away), so Upload/Processing/Blueprint Ready
// are always complete by the time this runs. `hasStartedLearning` stays
// false until real Learning Sessions exist (Sprint 2+ Workspace) —
// never faked as complete.
export function deriveProjectLifecycle(hasStartedLearning: boolean): readonly ProjectLifecycleStageState[] {
  return [
    { id: 'upload', status: 'complete' },
    { id: 'processing', status: 'complete' },
    { id: 'blueprint-ready', status: hasStartedLearning ? 'complete' : 'current' },
    { id: 'learning-started', status: hasStartedLearning ? 'current' : 'upcoming' },
    { id: 'completed', status: 'upcoming' },
  ]
}
