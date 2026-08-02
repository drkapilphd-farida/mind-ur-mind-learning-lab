'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { BlueprintDensityLevel, BlueprintDifficulty, LearningBlueprint } from '@/types/learning/blueprint'

type AIObservationCardsProps = {
  blueprint: LearningBlueprint
  // AI Learning Studio™ Sprint ALS-4 — real, from analyzeDocumentContent.
  // Previously this card showed blueprint.estimatedMinutes (the mock
  // multi-step "learning time" estimate) mislabeled as "reading time."
  estimatedReadingMinutes: number
}

// Distinct from DifficultyBadge's Beginner-Friendly/Intermediate/Advanced
// labels used elsewhere on this same page (BlueprintHero) — this is a
// different, shorter register purpose-built for a compact observation
// card, both reading from the same underlying `difficulty` value.
const READING_DIFFICULTY_LABEL: Record<BlueprintDifficulty, string> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'High',
}

const MEMORY_DENSITY_LABEL: Record<BlueprintDensityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

type ObservationCard = {
  emoji: string
  label: string
  value: string
}

// AI Observations™ (Sprint LW-1E, Section 1) — six premium glassmorphism
// cards, replacing the prior "Blueprint Overview" section on this page.
// Every value reads from LearningBlueprint's real, Claude-enriched fields
// (Production AI Integration — generateRealLearningBlueprint.ts) — no new
// business logic here, only presentation of already-generated data.
export function AIObservationCards({ blueprint, estimatedReadingMinutes }: AIObservationCardsProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const cards: readonly ObservationCard[] = [
    { emoji: '📖', label: 'Reading Difficulty', value: READING_DIFFICULTY_LABEL[blueprint.difficulty] },
    { emoji: '⏱', label: 'Estimated Reading Time', value: `${estimatedReadingMinutes} Minutes` },
    { emoji: '🧠', label: 'Memory Density', value: MEMORY_DENSITY_LABEL[blueprint.memoryDensity] },
    { emoji: '📚', label: 'Key Concepts', value: String(blueprint.concepts.length) },
    { emoji: '👁', label: 'Visual Content', value: `${blueprint.diagramCount} Diagram${blueprint.diagramCount === 1 ? '' : 's'}` },
    { emoji: '📑', label: 'Major Topics', value: String(blueprint.topics.length) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={cn(
            'rounded-3xl border border-border bg-background/60 px-5 py-6 text-center shadow-sm backdrop-blur-sm',
            !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both',
          )}
          style={!prefersReducedMotion ? { animationDelay: `${index * 90}ms` } : undefined}
        >
          <span className="text-2xl" aria-hidden="true">
            {card.emoji}
          </span>
          <p className={cn(TYPOGRAPHY.caption, 'mt-2')}>{card.label}</p>
          <p className={cn(TYPOGRAPHY.h3, 'mt-1')}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
