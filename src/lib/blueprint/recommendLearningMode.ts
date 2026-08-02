import type { LearningBlueprint } from '@/types/learning/blueprint'

// AI Recommendation Engine™ (Sprint LW-1E). Implements the brief's own
// IF/THEN rules literally, in priority order, against real (mock) blueprint
// attributes — never a live AI call, never a guess at the document's
// subject. "Visual Learning™" (one of the brief's own example
// recommendations) doesn't appear anywhere in the brief's own 9-item
// Learning Modes list, so a high-visual-content document recommends
// Mind Map™ instead — the closest real, listed mode for visual/structural
// understanding, not a 10th mode invented to fill the gap.
//
// Deliberately excludes subject-based branching (Biology → Memory Mode™,
// Law → AI Mentor™, etc., from the brief's "Dynamic Recommendation Engine"
// examples) — no subject/category field exists anywhere in the documents
// schema or LearningBlueprint, and guessing one from the document title via
// keyword-matching would be exactly the kind of fabricated specificity this
// codebase has consistently avoided. That branch is a disclosed future
// hook (see docs/PRODUCTION_HANDOFF_LW_1E.md), not implemented here.
// AI Learning Studio™ Sprint ALS-21 amendment — `research-mode` removed
// from this union. A production audit found the default/fallback branch
// below recommended Research Mode™ as the AI's own top pick, even though
// it has no real runtime — the AI Recommendation Hero would feature it
// prominently with a "Start Recommended Mode" button leading straight to
// the Workspace's own "Coming in a future production sprint" stub. This
// engine must only ever recommend a mode with a real, connected runtime
// today; when Research Mode™ (or any other currently-unavailable mode)
// gets one, it can re-enter this union and gain a real IF/THEN branch.
export type RecommendedLearningModeId = 'quantum-speed-reading' | 'memory-mode' | 'mind-map'

export type LearningModeRecommendation = {
  modeId: RecommendedLearningModeId
  reason: string
}

const HIGH_VISUAL_CONTENT_THRESHOLD = 10

export function recommendLearningMode(blueprint: LearningBlueprint): LearningModeRecommendation {
  if (blueprint.difficulty === 'advanced') {
    return {
      modeId: 'quantum-speed-reading',
      reason:
        "This chapter is concept-heavy and requires continuous reading. We recommend beginning with Quantum Speed Reading™ to improve comprehension before memory practice.",
    }
  }

  if (blueprint.memoryDensity === 'high') {
    return {
      modeId: 'memory-mode',
      reason: 'This material asks you to remember a large number of facts and details. We recommend Memory Mode™ to build strong, lasting retention from the start.',
    }
  }

  if (blueprint.diagramCount >= HIGH_VISUAL_CONTENT_THRESHOLD) {
    return {
      modeId: 'mind-map',
      reason: 'This material relies heavily on diagrams and visual structure. We recommend Mind Map™ to build understanding through those relationships first.',
    }
  }

  return {
    modeId: 'quantum-speed-reading',
    reason: 'A steady first read is the best place to start with this material. We recommend Quantum Speed Reading™ to build a solid foundation before anything else.',
  }
}
