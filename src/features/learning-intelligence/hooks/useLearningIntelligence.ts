'use client'

// Orchestration hook (Sprint 3, Chunk 4) — a thin `useMutation` wrapper
// around generateLearningPlanAction, following this platform's stated
// state-management convention (TanStack Query for server state). Not
// imported by any page yet; this chunk adds the reusable piece a
// future Sprint's UI would call, per its own approved "orchestration
// actions/hooks only" scope.

import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { generateLearningPlanAction } from '../actions'
import type { LearningPlan } from '../types'

export function useLearningIntelligence(): UseMutationResult<LearningPlan, Error, string> {
  return useMutation({
    mutationFn: async (documentId: string): Promise<LearningPlan> => {
      const result = await generateLearningPlanAction(documentId)
      if (!result.success) throw new Error(result.error)
      return result.plan
    },
  })
}
