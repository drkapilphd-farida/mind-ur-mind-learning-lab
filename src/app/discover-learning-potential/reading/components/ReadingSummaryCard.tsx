'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { AdaptiveTrend } from '@/features/discover-learning-potential/types'
import { buildReadingProfileHighlights } from '@/features/reading-discovery/buildReadingProfileHighlights'
import { buildQuantumSpeedReadingReason } from '@/features/reading-discovery/buildQuantumSpeedReadingReason'
import { buildAiPersonalInsight } from '@/features/reading-discovery/buildAiPersonalInsight'
import { pickGrowthPotentialMessage } from '@/features/reading-discovery/pickGrowthPotentialMessage'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type ReadingSummaryCardProps = {
  onContinue: () => void
  measuredWpm: number | null
  signalCount: number
  hesitationCount: number
  trend: AdaptiveTrend
  comprehensionAccuracy: number | null
}

type RevealPhase = 'analyzing' | 'measuring' | 'understanding' | 'building' | 'preparing' | 'reveal'

const REVEAL_PHASE_ORDER: readonly RevealPhase[] = ['analyzing', 'measuring', 'understanding', 'building', 'preparing', 'reveal']

// Sprint-2.7 FIX-30 — "AI Analysis Experience™... premium... lasting
// approximately 2–3 seconds... feel like a real AI is understanding the
// user." Copy aligned to the brief's own real example messages.
const REVEAL_PHASE_COPY: Record<Exclude<RevealPhase, 'reveal'>, string> = {
  analyzing: 'Analyzing Reading Rhythm…',
  measuring: 'Measuring Reading Efficiency…',
  understanding: 'Understanding Reading Patterns…',
  building: 'Building Your Reading Profile…',
  preparing: 'Preparing Your Learning Blueprint…',
}

// 5 real phases × 500ms = 2.5s total — inside the brief's own "2–3
// seconds" window. No fake progress bar, just one smooth, real message
// transition at a time.
const REVEAL_PHASE_MS = 500

// Reading Discovery™ Result screen — Sprint-2.6B FIX-17/FIX-21's own
// GOLDEN RESULT HIERARCHY (locked, never to be reordered): 🥇 Reading
// Profile → 🥈 Effective Reading Speed → 🥉 Reading Efficiency → ⭐
// Biggest Improvement → 🚀 Quantum Speed Reading™. The Reading Profile —
// a real identity, never a number — is the first thing the user sees and
// the visual hero (biggest card, boldest type); `measuredWpm` (the real,
// multi-signal Effective Reading Speed from `computeEffectiveReadingPerformance`
// — never raw WPM alone, FIX-16) only appears after it.
//
// Sprint-2.7 FIX-28/FIX-31/FIX-32 — the real "This is how you naturally
// read" subheading turns the opening beat into a personal story, not a
// report header (FIX-31). Between Biggest Opportunity and the Next
// Journey card sits one real, evidence-based AI Personal Insight
// (`buildAiPersonalInsight`, FIX-32) — a single sentence pairing this
// session's own real strength with its own real next step — so the
// bridge into Quantum Speed Reading™ reads as earned (FIX-28: Profile →
// Opportunity → Insight → Next Journey → CTA), never a promotional jump.
// Per your own explicit "Supplement" choice, Continue-to-Memory-Discovery
// stays, unchanged, as a secondary action. Still opens with the same
// real staged Reading Profile Reveal™ (Sprint-2B) — "Do NOT instantly
// show results."
export function ReadingSummaryCard({ onContinue, measuredWpm, signalCount, hesitationCount, trend, comprehensionAccuracy }: ReadingSummaryCardProps): React.JSX.Element {
  const router = useRouter()
  const [phaseIndex, setPhaseIndex] = useState(0)
  const phase = REVEAL_PHASE_ORDER[phaseIndex] ?? 'reveal'

  useEffect(() => {
    if (phase === 'reveal') return
    const timer = window.setTimeout(() => setPhaseIndex((index) => index + 1), REVEAL_PHASE_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (phase !== 'reveal') {
    return (
      <ReadingExperimentLayout brandMarkSize="lg">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
          <motion.p key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className={TYPOGRAPHY.h4}>
            {REVEAL_PHASE_COPY[phase]}
          </motion.p>
        </div>
      </ReadingExperimentLayout>
    )
  }

  const highlights = buildReadingProfileHighlights(trend, hesitationCount, signalCount, comprehensionAccuracy)
  const whyQuantumSpeedReadingHelps = buildQuantumSpeedReadingReason(highlights.biggestImprovement)
  const aiPersonalInsight = buildAiPersonalInsight(highlights.biggestImprovement)
  const growthPotentialMessage = pickGrowthPotentialMessage(signalCount)

  const handleStartQuantumSpeedReading = (): void => {
    const params = new URLSearchParams()
    if (measuredWpm !== null) params.set('wpm', String(measuredWpm))
    params.set('style', highlights.profileLabel)
    params.set('opportunity', highlights.biggestImprovement)
    router.push(`/discover-learning-potential/reading/quantum-speed-reading-intro?${params.toString()}`)
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        🎉 Reading Discovery Complete
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        className="text-base font-medium text-muted-foreground"
      >
        This is how you naturally read.
      </motion.p>

      {/* Sprint-2.6B GOLDEN RESULT HIERARCHY — 🥇 Reading Profile is the
          real hero: the first card, the biggest card, the boldest type. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/60 bg-card px-8 py-8 shadow-lg"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your Reading Profile</p>
        <p className="mt-2 font-heading text-4xl font-bold text-foreground">{highlights.profileLabel}</p>
      </motion.div>

      {/* 🥈 Effective Reading Speed — only after the Reading Profile,
          never the hero, never raw WPM alone (FIX-16). */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.36, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card px-8 py-5 shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Effective Reading Speed</p>
        <p className="mt-1 font-heading text-3xl font-bold text-foreground">{measuredWpm !== null ? `${measuredWpm} WPM` : 'Calculating…'}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.52, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Reading Efficiency</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{highlights.efficiencyLine}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.68, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Biggest Opportunity</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{highlights.biggestImprovement}</p>
      </motion.div>

      {/* Sprint-2.7 FIX-28/FIX-32 — the one memorable AI Personal Insight,
          the emotional bridge between the Opportunity above and the Next
          Journey below. */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.84, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/60 bg-card p-6 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your AI Insight</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{aiPersonalInsight}</p>
      </motion.div>

      {/* Sprint-2.6 FIX-05 / Sprint-2.7 FIX-28 — Profile → Opportunity →
          AI Insight → Next Journey → Start. Reads as the obvious next
          step, never a hard sell. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 1.0, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left shadow-lg shadow-primary/10"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-primary')}>Next Journey</p>
        <p className="mt-1 text-sm text-muted-foreground">{whyQuantumSpeedReadingHelps}</p>
        <p className="mt-3 font-heading text-xl font-bold text-foreground">🚀 Quantum Speed Reading™</p>
        <p className="mt-1 text-sm text-muted-foreground">Read Fast. Learn Better.</p>
        <p className="mt-2 text-sm font-semibold text-primary">{growthPotentialMessage}</p>
        <Button size="lg" className="mt-4 min-h-12 w-full rounded-full text-base font-semibold" onClick={handleStartQuantumSpeedReading}>
          Start Now
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1.14, ease: 'easeOut' }}>
        <Button size="lg" variant="outline" className="min-h-14 min-w-[240px] rounded-full text-base font-semibold" onClick={onContinue}>
          Continue to Memory Discovery
        </Button>
      </motion.div>
    </div>
  )
}
