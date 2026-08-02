import type { ExecutionStep } from '../executionDomain'
import type { PersonalizationRecommendationSet, RecommendationGroup, RecommendationItem, RecommendationPriority } from '../recommendationDomain'
import type { RecommendationBuilderInputs } from './RecommendationBuilderInputs'

// "No ML." A simple, explainable, deterministic escalation ladder — one
// tier up per step, `critical` has no ceiling above it.
const ESCALATION: Record<RecommendationPriority, RecommendationPriority> = {
  low: 'normal',
  normal: 'high',
  high: 'critical',
  critical: 'critical',
}

function buildRecommendationItem(step: ExecutionStep, escalate: boolean): RecommendationItem {
  return {
    id: `recommendation-${step.id}`,
    category: step.sequenceType,
    referenceId: step.referenceId,
    priority: escalate ? ESCALATION[step.priority] : step.priority,
    rationale: step.detail,
  }
}

// Pure — "Generate recommendations from [the execution plan] ... No AI
// inference." Maps each `PersonalizationExecutionPlan` sequence (Sprint
// 25, already deterministically ordered) to a `RecommendationGroup`,
// and each `ExecutionStep` to a `RecommendationItem` — `rationale` is
// carried over from `step.detail` verbatim rather than re-derived from
// `decisions`/`strategyResults`, since Sprint 25's own sequencers
// already resolved the correct strategy-preferred text there. Memory
// Context gets one deterministic rule: a `hasCriticalSection` fact
// escalates every item's priority one tier.
export function buildRecommendationSet(inputs: RecommendationBuilderInputs, now: string, id: string): PersonalizationRecommendationSet {
  const escalate = inputs.memoryFacts.hasCriticalSection === true

  const groups: RecommendationGroup[] = inputs.executionPlan.sequences.map((sequence) => ({
    category: sequence.type,
    items: sequence.steps.map((step) => buildRecommendationItem(step, escalate)),
  }))

  return {
    id,
    version: 1,
    groups,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'recommendation-builder', generatedAt: now },
  }
}
