import type { RecommendedLearningModeId } from './recommendLearningMode'

type ConnectedLearningModeId = 'quantum-speed-reading' | 'memory-mode' | 'mind-map'

const CONNECTED_RECOMMENDATION_MODE_IDS: readonly RecommendedLearningModeId[] = ['quantum-speed-reading', 'memory-mode', 'mind-map']

function isConnectedModeId(modeId: RecommendedLearningModeId): modeId is ConnectedLearningModeId {
  return CONNECTED_RECOMMENDATION_MODE_IDS.includes(modeId)
}

// AI Learning Studio™ Sprint ALS-7 — which real, connected Learning Mode
// the Learning Blueprint™'s primary "Start Learning" CTA should launch:
// the AI Recommendation Engine's own real pick (recommendLearningMode)
// when it's one of the modes with a real Learning Workspace™ runtime
// today, falling back to Reading when the recommendation itself isn't
// connected yet. Previously the primary CTA always launched Reading
// regardless of the recommendation, disagreeing with the AI Recommendation
// hero shown directly below it whenever Memory Mode™ was recommended.
//
// AI Learning Studio™ Sprint ALS-21 amendment — `mind-map` added to the
// connected set. A production audit found this function still treated
// Mind Map™ as disconnected and silently substituted Reading whenever the
// AI recommended it — stale since ALS-13 gave Mind Map™ a real runtime,
// over four sprints before this fix. `recommendLearningMode.ts`'s own
// `RecommendedLearningModeId` union no longer includes `research-mode` at
// all (a companion fix, same sprint), so every value this function can
// receive is connected today — this safety net stays in place for the
// day a future recommendation category isn't.
export function selectPrimaryLearningMode(recommendedModeId: RecommendedLearningModeId): ConnectedLearningModeId {
  return isConnectedModeId(recommendedModeId) ? recommendedModeId : 'quantum-speed-reading'
}
