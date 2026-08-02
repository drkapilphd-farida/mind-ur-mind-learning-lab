'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { FocusIntelligenceReport } from '@/features/focus-discovery/focusIntelligenceEngine'
import { FocusExperimentLayout } from './FocusExperimentLayout'

type FocusDiscoveryReportCardProps = {
  report: FocusIntelligenceReport
  onContinue: () => void
}

// HERO REVEAL SEQUENCE™ — Sprint-2.0. "Reveal information gradually...
// the reveal should feel intentional." A real, staged sequence — never
// one static spinner — before the real report ever appears.
const REVEAL_STAGES = ['Assessment complete.', 'Analyzing your attention pattern…', 'Building your cognitive profile…', 'Preparing your AI report…'] as const
const STAGE_DURATION_MS = 650

const STABILITY_RING_RADIUS = 42
const STABILITY_RING_CIRCUMFERENCE = 2 * Math.PI * STABILITY_RING_RADIUS

function ScoreCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 text-left">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function JourneyBar({ label, percent }: { label: string; percent: number }): React.JSX.Element {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Focus Intelligence Engine™ — Sprint-2.0 Hero Results Experience™.
// "Do not end the assessment with a report. End it with self-discovery."
// LOCKED PRINCIPLE — "never make numbers the hero... identity comes
// first, numbers support identity" — the real profile name is the
// first, largest, boldest thing revealed; every real number after it
// only ever supports that real identity.
export function FocusDiscoveryReportCard({ report, onContinue }: FocusDiscoveryReportCardProps): React.JSX.Element {
  const [stageIndex, setStageIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    if (stageIndex >= REVEAL_STAGES.length - 1) {
      const timer = window.setTimeout(() => setIsRevealed(true), STAGE_DURATION_MS)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setStageIndex((index) => index + 1), STAGE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [stageIndex])

  if (!isRevealed) {
    return (
      <FocusExperimentLayout>
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={TYPOGRAPHY.h4}
            >
              {REVEAL_STAGES[stageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </FocusExperimentLayout>
    )
  }

  const ringOffset = STABILITY_RING_CIRCUMFERENCE * (1 - report.heroMetricPercent / 100)

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      {/* HERO HEADER™ + PROFILE DESCRIPTION™ — the real identity, first,
          largest, boldest. Never a raw score. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/60 bg-card px-8 py-8 shadow-lg"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>🧠 Your Focus Profile™</p>
        <p className="mt-2 font-heading text-4xl font-bold text-foreground">{report.profileName}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.profileDescription}</p>
      </motion.div>

      {/* HERO METRIC™ — "avoid presenting a percentage as the primary
          hero element... large value." The bare real number, no "%". */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.24, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card px-8 py-6 shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>🛡 {report.heroMetricLabel}</p>
        <div className="relative mx-auto mt-3 flex size-28 items-center justify-center">
          <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
            <circle cx="50" cy="50" r={STABILITY_RING_RADIUS} fill="none" strokeWidth="8" className="stroke-muted" />
            <motion.circle
              cx="50"
              cy="50"
              r={STABILITY_RING_RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-primary"
              strokeDasharray={STABILITY_RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: STABILITY_RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            />
          </svg>
          <span className="absolute font-heading text-3xl font-bold text-foreground">{report.heroMetricPercent}</span>
        </div>
      </motion.div>

      {/* PREMIUM SCORE CARD™ — clean, minimal, real supporting numbers —
          never the hero. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36, ease: 'easeOut' }}
        className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <ScoreCard label="Focus Efficiency" value={`${report.focusEfficiencyPercent}%`} />
        <ScoreCard label="Reaction Precision" value={`${report.reactionPrecisionPercent}%`} />
        <ScoreCard label="Visual Search Accuracy" value={`${report.visualSearchAccuracyPercent}%`} />
        <ScoreCard label="Rule Adaptation" value={`${report.ruleAdaptationPercent}%`} />
        <ScoreCard label="Mission Completion" value={`${report.missionsCompleted}/${report.totalMissions}`} />
      </motion.div>

      {/* STRONGEST COGNITIVE STRENGTH™ */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.48, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Strongest Cognitive Strength</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.strongestSkillLabel}</p>
      </motion.div>

      {/* GROWTH OPPORTUNITY™ — never "weakness." */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/40 bg-card p-5 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Growth Opportunity</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.growthOpportunityLine}</p>
      </motion.div>

      {/* AI COGNITIVE INSIGHT™ — "the most important paragraph... every
          sentence must connect to observed behaviour." */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.72, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-border/60 bg-card p-6 text-left shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>AI Cognitive Insight</p>
        <p className={cn(TYPOGRAPHY.h4, 'mt-1.5')}>{report.personalInsight}</p>
      </motion.div>

      {/* ATTENTION JOURNEY SUMMARY™ — a compact, elegant visual timeline. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.84, ease: 'easeOut' }}
        className="w-full space-y-3 rounded-2xl border border-border/40 bg-card p-5 shadow-md"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground', 'text-left')}>Attention Journey</p>
        {report.journey.map((entry) => (
          <JourneyBar key={entry.mission} label={entry.label} percent={entry.ratioPercent} />
        ))}
      </motion.div>

      {/* AI RECOMMENDATION™ — one real next step, with its own real
          reasoning. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.96, ease: 'easeOut' }}
        className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left shadow-lg shadow-primary/10"
      >
        <p className={cn(TYPOGRAPHY.label, 'text-primary')}>Recommended Next Step</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{report.recommendation}</p>
      </motion.div>

      {/* LEARNING POTENTIAL MESSAGE™ — a real, hopeful conclusion. */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.06, ease: 'easeOut' }}
        className="text-sm leading-6 text-muted-foreground"
      >
        {report.learningPotentialMessage}
      </motion.p>

      {/* EMOTIONAL CLOSING™ — a real, calm, staged close before Continue. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.16, ease: 'easeOut' }}
        className="space-y-1"
      >
        <p className="text-sm font-medium text-foreground">Your Focus Discovery is complete.</p>
        <p className="text-xs text-muted-foreground">The AI now understands how you naturally maintain attention.</p>
        <p className="text-xs text-muted-foreground">This profile will personalize your learning journey.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1.3, ease: 'easeOut' }}>
        <Button size="lg" className="min-h-14 min-w-[240px] rounded-full text-base font-semibold" onClick={onContinue}>
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
