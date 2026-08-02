'use client'

import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Brain, CheckCircle2, Sparkles, Target, Zap } from 'lucide-react'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'
import {
  getReadingSpeedLabel,
  getMindScoreLabel,
  computeOverallMindScore,
  buildMindProfileBreakdown,
  QUANTUM_SPEED_TARGET_WPM,
  computeQuantumGapFillPercent,
  buildQuantumSpeedCopy,
} from './mindProfileDataset'
import { getMemoryEfficiencyLabel } from './memoryChallengeDataset'
import { getAttentionLabel } from './focusChallengeDataset'

type MindProfileDashboardProps = {
  fullName: string
  readingWpm: number
  readingScore: number
  memoryEfficiencyPercent: number
  focusStabilityPercent: number
  onEnterDashboard: () => void
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

type SummaryCardProps = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string
  label: string
  highlight?: boolean
}

function SummaryCard({ icon: Icon, title, value, label, highlight = false }: SummaryCardProps): React.JSX.Element {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'flex flex-col gap-2 rounded-2xl border p-5',
        highlight ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card/60',
      )}
    >
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-full',
          highlight ? 'bg-primary/15 text-primary' : 'bg-foreground/5 text-muted-foreground',
        )}
      >
        <Icon className="size-4" />
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className={cn('text-sm font-medium', highlight ? 'text-primary' : 'text-muted-foreground')}>{label}</p>
    </motion.div>
  )
}

// Final screen of the 2-minute assessment lead magnet — a static report
// summarizing the three already-earned scores plus one derived Overall
// Mind Score, the 600 WPM Quantum Speed positioning (shown regardless of
// how high the user's own score is — the assessment only ever measures
// untrained baseline speed, so there's always real room above it), and
// the CTA into the paid Quantum Speed Reading Program. Purely
// presentational: every number displayed here was computed by an
// earlier screen or by mindProfileDataset's own honest, documented
// formulas — nothing here recalculates or overrides those.
// `onEnterDashboard` fires once, only from the CTA's own click.
export function MindProfileDashboard({
  fullName,
  readingWpm,
  readingScore,
  memoryEfficiencyPercent,
  focusStabilityPercent,
  onEnterDashboard,
}: MindProfileDashboardProps): React.JSX.Element {
  const readingSpeedLabel = getReadingSpeedLabel(readingWpm)
  const memoryLabel = getMemoryEfficiencyLabel(memoryEfficiencyPercent)
  const focusLabel = getAttentionLabel(focusStabilityPercent)
  const overallScore = computeOverallMindScore(readingScore, memoryEfficiencyPercent, focusStabilityPercent)
  const overallLabel = getMindScoreLabel(overallScore)
  const breakdownText = buildMindProfileBreakdown(
    fullName,
    { reading: readingScore, memory: memoryEfficiencyPercent, focus: focusStabilityPercent },
    overallScore,
    overallLabel,
  )
  const quantumGapFillPercent = computeQuantumGapFillPercent(readingWpm)
  const quantumSpeedCopy = buildQuantumSpeedCopy(readingWpm)

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-2xl">
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
          <LivingBrainLogo size={56} animated={false} decorative={false} />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Comprehensive Mind Profile
          </h1>
          <p className="text-sm font-medium text-muted-foreground">{fullName}</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4"
        >
          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden="true" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Your Comprehensive Mind Profile is unlocked below!
          </p>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <SummaryCard icon={Zap} title="Reading Speed" value={`${readingWpm} WPM`} label={readingSpeedLabel} />
          <SummaryCard icon={Brain} title="Memory Efficiency" value={`${memoryEfficiencyPercent}%`} label={memoryLabel} />
          <SummaryCard icon={Target} title="Focus Stability" value={`${focusStabilityPercent}%`} label={focusLabel} />
          <SummaryCard icon={Sparkles} title="Overall Mind Score" value={`${overallScore}/100`} label={overallLabel} highlight />
        </div>

        <motion.div variants={fadeUp} className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6">
          <p className="text-sm leading-relaxed text-foreground">{breakdownText}</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-6"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
            <Zap className="size-3.5" aria-hidden="true" />
            Quantum Speed Reading Target
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Your Baseline</p>
              <p className="font-heading text-3xl font-bold tabular-nums text-foreground">
                {readingWpm} <span className="text-base font-medium text-muted-foreground">WPM</span>
              </p>
            </div>
            <ArrowRight className="mb-1.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Quantum Target</p>
              <p className="font-heading bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text text-3xl font-bold tabular-nums text-transparent">
                {QUANTUM_SPEED_TARGET_WPM}+ <span className="text-base font-medium text-muted-foreground">WPM</span>
              </p>
            </div>
          </div>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${quantumGapFillPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground">{quantumSpeedCopy}</p>
        </motion.div>

        <motion.button
          variants={fadeUp}
          type="button"
          onClick={onEnterDashboard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className={cn(
            'group mt-8 flex w-full items-center justify-center gap-2 rounded-full px-8 py-4',
            'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500',
            'text-base font-semibold text-white shadow-lg shadow-indigo-500/30',
            'transition-shadow duration-300 hover:shadow-xl hover:shadow-teal-500/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          🔥 Unlock 600+ WPM Quantum Speed Reading Now
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </div>
  )
}
