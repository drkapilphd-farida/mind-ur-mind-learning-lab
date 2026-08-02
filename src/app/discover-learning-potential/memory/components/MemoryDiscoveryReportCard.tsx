'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { MemoryIntelligenceReport } from '@/features/memory-discovery/memoryIntelligenceEngine'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

type MemoryDiscoveryReportCardProps = {
  report: MemoryIntelligenceReport
  onContinue: () => void
}

// Long enough to read as a real, deliberate beat; short enough to stay
// well under the "never rush, never drag" feel every other loading beat
// in this app already uses.
const PREPARING_PHASE_MS = 1200
const EFFICIENCY_RING_RADIUS = 42
const EFFICIENCY_RING_CIRCUMFERENCE = 2 * Math.PI * EFFICIENCY_RING_RADIUS

// Memory Intelligence Engine™ — Sprint-2. "Do not build a Result Screen.
// Build a Memory Discovery Report." Replaces the old generic bullet-list
// closing screen. Positive Psychology Engine™ (FIX-09) — every section
// below renders in this exact locked emotional order: Identity → (You
// Read At-style) Efficiency → Strength → Opportunity → Insight → Pattern
// (how your brain remembers) → Hope/Next Journey. Never reordered. Still
// opens with the same real staged "Preparing…" beat Sprint-1 established
// — "Do NOT instantly show results."
export function MemoryDiscoveryReportCard({ report, onContinue }: MemoryDiscoveryReportCardProps): React.JSX.Element {
  const [isPreparing, setIsPreparing] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPreparing(false), PREPARING_PHASE_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (isPreparing) {
    return (
      <MemoryExperimentLayout brandMarkSize="lg">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
          <p className={TYPOGRAPHY.h4}>Preparing Memory Profile…</p>
        </div>
      </MemoryExperimentLayout>
    )
  }

  const ringOffset = EFFICIENCY_RING_CIRCUMFERENCE * (1 - report.efficiencyPercent / 100)

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        🎉 Memory Discovery Complete
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        className="text-base font-medium text-muted-foreground"
      >
        This is how your memory naturally works.
      </motion.p>

      {/* FIX-01 — 🧠 Your Memory Profile, the real hero: the first card,
          the biggest card, the boldest type. Never a score. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/60 bg-card px-8 py-8 shadow-lg"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your Memory Profile</p>
        <p className="mt-2 font-heading text-4xl font-bold text-foreground">{report.profileLabel}</p>
      </motion.div>

      {/* FIX-02 — Memory Efficiency, only after the Profile, never the hero. */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.36, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card px-8 py-6 shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Memory Efficiency</p>
        <div className="relative mx-auto mt-3 flex size-28 items-center justify-center">
          <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
            <circle cx="50" cy="50" r={EFFICIENCY_RING_RADIUS} fill="none" strokeWidth="8" className="stroke-muted" />
            <motion.circle
              cx="50"
              cy="50"
              r={EFFICIENCY_RING_RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-primary"
              strokeDasharray={EFFICIENCY_RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: EFFICIENCY_RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            />
          </svg>
          <span className="absolute font-heading text-2xl font-bold text-foreground">{report.efficiencyPercent}%</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.efficiencyLine}</p>
      </motion.div>

      {/* FIX-03 — Strongest Memory Skill, celebrated before any opportunity. */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.52, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Strongest Memory Skill</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.strongestSkillLabel}</p>
      </motion.div>

      {/* FIX-04 — Biggest Growth Opportunity, framed as an opportunity,
          never a weakness. */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.68, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your Next Opportunity</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.growthOpportunityLabel}</p>
      </motion.div>

      {/* FIX-05/FIX-07 — AI Personal Insight, with a quiet, non-numeric
          confidence tag (never a percentage). */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.84, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/60 bg-card p-6 text-left shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Your AI Insight</p>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{report.confidenceLevel}</span>
        </div>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.personalInsight}</p>
      </motion.div>

      {/* FIX-06 — How Your Brain Naturally Remembers. */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.0, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>How Your Brain Naturally Remembers</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.patternSummary}</p>
      </motion.div>

      {/* FIX-11/FIX-12/FIX-14 — the natural next step, never a sales
          pitch: a short bridge line, real hope, real replay value. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 1.16, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left shadow-lg shadow-primary/10"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-primary')}>Ready to Unlock Memory Mode™</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Now that we&rsquo;ve discovered how your memory works, let&rsquo;s strengthen it with personalized Memory Mode™ exercises.
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">This is your starting point — your memory can grow stronger with practice.</p>
        <p className="mt-1 text-xs text-muted-foreground">Retake Memory Discovery after a few sessions to see how your profile evolves.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1.3, ease: 'easeOut' }}>
        <Button size="lg" className="min-h-14 min-w-[240px] rounded-full text-base font-semibold" onClick={onContinue}>
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
