'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { DifficultyTier } from '@/types/exercise-engine'
import type { LearningIntelligenceEngine } from '@/features/discover-learning-potential/intelligence/LearningIntelligenceEngine'
import { useContinuousSprintRuntime, type SprintRuntimeCompletion } from '@/features/reading-discovery/useContinuousSprintRuntime'
import type { ReadingSprintId } from '@/features/reading-discovery/readingSprints'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { LivePerformanceBar } from './LivePerformanceBar'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'
import { ComprehensionCard } from './ComprehensionCard'
import { SingleLineReadingRail } from './SingleLineReadingRail'

type LiveSprintRuntimeViewProps = {
  sprint: ReadingSprintId
  tier: DifficultyTier
  engine: LearningIntelligenceEngine
  // Sprint-2.5 FIX-03 — a real Set shared by the orchestrator across every
  // Sprint in this same session, so a later Sprint never re-surfaces a
  // real content/question id an earlier Sprint already used.
  sharedUsedContentIds: Set<string>
  onComplete: (completion: SprintRuntimeCompletion) => void
}

const TEXT_MAX_WIDTH: Record<ReadingSprintId, string> = {
  word: 'max-w-xl',
  phrase: 'max-w-lg',
  sentence: 'max-w-xl',
  paragraph: 'max-w-md',
  meaning: 'max-w-lg',
}

const TEXT_STYLE: Record<Exclude<ReadingSprintId, 'meaning' | 'paragraph'>, string> = {
  word: 'font-heading text-5xl font-bold text-foreground sm:text-6xl',
  phrase: 'font-heading text-2xl font-semibold text-foreground sm:text-3xl',
  sentence: 'font-heading text-2xl leading-snug font-semibold text-foreground sm:text-3xl',
}

// Reading Runtime Engine™ (Sprint-2 Part-2), corrected per Reading
// Runtime Corrections™ (Sprint-2 Part-2A) and Sprint-2.6B FIX-20 (real
// questions now exist in exactly one place — Reading Understanding —
// never embedded inside another Sprint). Reuses `ReadingExperimentLayout`
// (unchanged shell/motion/theme) and `ComprehensionCard` (unchanged)
// verbatim — only what cycles inside them is new. Each real item's own
// real text fades/scales in and out (`AnimatePresence`) as the runtime
// hook advances — "words flow naturally... never abrupt screen
// changes." Paragraph Sprint's real reading items render through the
// Single-Line Reading Rail™ (FIX-19) instead of showing the full
// paragraph at once.
export function LiveSprintRuntimeView({ sprint, tier, engine, sharedUsedContentIds, onComplete }: LiveSprintRuntimeViewProps): React.JSX.Element {
  const runtime = useContinuousSprintRuntime(sprint, tier, engine, sharedUsedContentIds, onComplete)
  const { currentItem, wpm, combo, xp } = runtime
  const performanceBar = <LivePerformanceBar sprint={sprint} wpm={wpm} combo={combo} xp={xp} />

  if (currentItem === null) {
    return (
      <ReadingExperimentLayout headerSlot={performanceBar}>
        <p className={TYPOGRAPHY.body}>Nice work.</p>
      </ReadingExperimentLayout>
    )
  }

  if (currentItem.kind === 'question') {
    // FIX-4/FIX-9 — keyed on the real question's own real id so
    // `ComprehensionCard` genuinely remounts (fresh internal state) for
    // every real question, fixing the "some selections do nothing" bug.
    return <ComprehensionCard key={currentItem.id} question={currentItem.question} onSelect={runtime.onOptionSelect} headerSlot={performanceBar} />
  }

  if (sprint === 'paragraph') {
    return (
      <ReadingExperimentLayout headerSlot={performanceBar} maxWidthClassName={TEXT_MAX_WIDTH.paragraph}>
        <SingleLineReadingRail key={currentItem.id} paragraph={currentItem.text} totalDurationMs={runtime.currentItemDurationMs ?? 6000} />
      </ReadingExperimentLayout>
    )
  }

  return (
    <ReadingExperimentLayout headerSlot={performanceBar} maxWidthClassName={TEXT_MAX_WIDTH[sprint]}>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(sprint !== 'meaning' && TEXT_STYLE[sprint])}
        >
          {currentItem.text}
        </motion.p>
      </AnimatePresence>
    </ReadingExperimentLayout>
  )
}
