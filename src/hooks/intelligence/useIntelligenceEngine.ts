'use client'

// useIntelligenceEngine — the single client-side hook any Lab uses to get
// all computed intelligence state from raw practice data.
//
// Server components should call engine functions directly; this hook is for
// client components that need live-updating intelligence state.

import { useMemo } from 'react'
import {
  calculateDimensionScore,
  calculateMindScore,
  calculateMomentum,
  calculateJourneyState,
  calculateEvolution,
  calculateRecommendation,
} from '@/lib/intelligence/engine'
import type { IntelligenceDimensionType, IntelligenceDimension, JourneyState } from '@/types/intelligence'
import type { DayActivity } from '@/lib/exercises/practiceHistory'

type UseIntelligenceEngineInput = {
  dimensionType: IntelligenceDimensionType
  completionPercent: number    // 0–100: exercises done vs total in this Lab
  currentStreak: number
  bestStreak: number
  weeklyDays: DayActivity[]    // 7-element array from computeWeeklyActivity
  activatedCount: number
  totalCount: number
  nextActionLabel: string | null
  nextActionHref: string | null
}

export function useIntelligenceEngine(input: UseIntelligenceEngineInput): {
  dimension: IntelligenceDimension
  mindScore: ReturnType<typeof calculateMindScore>
  momentum: number
  journeyState: JourneyState
  evolution: ReturnType<typeof calculateEvolution>
  recommendation: ReturnType<typeof calculateRecommendation>
} {
  const {
    dimensionType,
    completionPercent,
    currentStreak,
    bestStreak,
    weeklyDays,
    activatedCount,
    totalCount,
    nextActionLabel,
    nextActionHref,
  } = input

  return useMemo(() => {
    const weeklyActiveDays = weeklyDays.filter((d) => d.sessionCount > 0).length

    const dimensionScore = calculateDimensionScore({
      type: dimensionType,
      completionPercent,
      currentStreak,
    })

    const dimension: IntelligenceDimension = {
      type: dimensionType,
      score: dimensionScore,
      trend: null, // computed from weeklyDays if needed
      status: activatedCount === 0
        ? 'not-started'
        : activatedCount >= totalCount
          ? 'activated'
          : 'in-progress',
      isActive: true,
    }

    const mindScore = calculateMindScore([dimension])
    const momentum = calculateMomentum(currentStreak, bestStreak)

    const journeyState: JourneyState = calculateJourneyState({
      currentStreak,
      bestStreak,
      weeklyActiveDays,
      weeklyDays,
      activatedCount,
    })

    const evolution = calculateEvolution({
      currentDimension: dimensionType,
      activatedCount,
      totalCount,
      mindScore: mindScore.total,
    })

    const recommendation = calculateRecommendation({
      journeyState,
      evolutionState: evolution,
      nextActionLabel,
      nextActionHref,
    })

    return {
      dimension,
      mindScore,
      momentum,
      journeyState,
      evolution,
      recommendation,
    }
  }, [
    dimensionType, completionPercent, currentStreak, bestStreak,
    weeklyDays, activatedCount, totalCount, nextActionLabel, nextActionHref,
  ])
}
