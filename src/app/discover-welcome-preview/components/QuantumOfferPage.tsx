'use client'

import { useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Brain, Check, Compass, Eye, Sparkles, Target, X, Zap } from 'lucide-react'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'

type QuantumOfferPageProps = {
  fullName: string
  readingWpm: number
  onClaimAccess: () => void
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

type Pillar = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

// This is not a mechanical speed-reading drill — it's a whole-brain
// program. The first four pillars are the actual mechanism; the fifth
// (Quantum Reading Speed) is the visible byproduct once the other four
// come online together, not a separate skill trained in isolation. The
// layout below deliberately mirrors that: four supporting cards, then
// one capstone card visually distinct from the rest.
const SUPPORTING_PILLARS: readonly Pillar[] = [
  {
    icon: Target,
    title: 'Laser Focus Shield',
    description: 'Mastering attention stability, so your mind stops drifting mid-page.',
  },
  {
    icon: Eye,
    title: 'Right-Brain Visualization',
    description: 'Processing blocks of text instantly, as whole images — not word by word.',
  },
  {
    icon: Compass,
    title: 'Deep Intuition',
    description: 'Grasping the core concept intuitively, before you\'ve consciously "read" it.',
  },
  {
    icon: Brain,
    title: 'Photographic Memory',
    description: 'Retaining 100% of what you read, without rehearsal or repetition.',
  },
]

const CAPSTONE_PILLAR: Pillar = {
  icon: Zap,
  title: 'Quantum Reading Speed',
  description: 'Achieving effortless 600+ WPM flow — the natural result of the four pillars above, not a trick layered on top.',
}

const OLD_WAY_POINTS: readonly string[] = [
  'Trains your eyes to skim faster',
  'Sacrifices comprehension for pace',
  'Collapses under complex material',
  'Speed disappears without constant drilling',
]

const QUANTUM_WAY_POINTS: readonly string[] = [
  'Builds real attention stability first',
  'Awakens right-brain visual processing',
  'Develops intuitive comprehension',
  'Speed emerges naturally, with full retention',
]

// The program is explicitly universal, not age-bracketed to students or
// to adults — neuroplasticity is the actual mechanism, and it stays
// active across every one of these ages, not just childhood.
const NEUROPLASTICITY_AGE_MARKERS: readonly string[] = ['8', '18', '35', '60+']

type PillarCardProps = { pillar: Pillar; highlight?: boolean }

function PillarCard({ pillar, highlight = false }: PillarCardProps): React.JSX.Element {
  const Icon = pillar.icon
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-6',
        highlight
          ? 'border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10'
          : 'border-border/60 bg-card/60',
      )}
    >
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          highlight ? 'bg-gradient-to-br from-indigo-500 to-teal-500 text-white' : 'bg-foreground/5 text-muted-foreground',
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="font-heading text-base font-bold text-foreground">{pillar.title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
    </div>
  )
}

// The Quantum Mind Development Program's offer page — the funnel's final
// screen before real enrollment/checkout. Purely presentational and
// static aside from echoing the user's own already-measured baseline
// WPM back to them; every section reveals once on scroll (whileInView)
// rather than all at page-load, since this is a long-form page, not a
// short result screen. `onClaimAccess` fires once, only from the CTA's
// own click.
export function QuantumOfferPage({ fullName, readingWpm, onClaimAccess }: QuantumOfferPageProps): React.JSX.Element {
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName

  useEffect(() => {
    // This screen swaps in as part of a client-side state machine, not a
    // real page navigation, so the browser's scroll position otherwise
    // carries over from whatever the previous (taller) screen left it
    // at. Section 1 below uses whileInView with `once: true` — if it
    // mounted already scrolled out of view, it would never register as
    // "entering" and would stay permanently invisible.
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:py-20">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2.5"
        >
          <LivingBrainLogo size={28} animated={false} />
          <span className="font-heading text-sm font-semibold tracking-tight text-foreground">Mind Ur Mind</span>
        </motion.div>

        {/* Section 1 — Personalized Assessment Hook */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mt-10 text-center"
        >
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mind Profile Analysis</p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Mind Profile Analysis is Complete.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {firstName}, you read at <strong className="font-semibold text-foreground">{readingWpm} WPM</strong> today —
            that&rsquo;s your conscious mind&rsquo;s ceiling. Your conscious speed is limited, but your right-brain{' '}
            <strong className="font-semibold text-foreground">Quantum potential is 600+ WPM</strong>, and it has never
            been trained.
          </p>

          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-border/60 bg-card/60 px-5 py-3">
            <p className="text-xs leading-relaxed font-medium text-muted-foreground sm:text-sm">
              ✨ Engineered for all stages of life—from Young Learners &amp; Students (Age 8+) to Working Professionals,
              Executives, and Lifelong Learners up to Age 60+.
            </p>
          </div>
        </motion.section>

        {/* Section 2 — The Science of Neuroplasticity at Any Age */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mt-16"
        >
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Neuroplasticity at Any Age
            </div>
            <h2 className="mt-3 text-center font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              The Science of Neuroplasticity at Any Age
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
              Your brain&rsquo;s neural pathways aren&rsquo;t fixed once childhood ends. They can be optimized and
              expanded at 8, at 18, at 35, or at 60 — neuroplasticity, the same underlying mechanism, stays active for
              life. Focus, intuition, and Quantum Reading Speed were never a young person&rsquo;s advantage. They&rsquo;re
              a trainable capacity, at any age, for as long as you&rsquo;re willing to practice.
            </p>

            <div className="mt-6 flex items-center justify-center">
              {NEUROPLASTICITY_AGE_MARKERS.map((age, index) => (
                <div key={age} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 text-xs font-bold text-white">
                      {age}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">Age</span>
                  </div>
                  {index < NEUROPLASTICITY_AGE_MARKERS.length - 1 && <div className="mx-2 h-px w-6 bg-border sm:w-10" />}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section 3 — The 5 Pillars of Quantum Mind */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mt-16"
        >
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              The 5 Pillars of Quantum Mind
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Five compounding abilities. The first four unlock the fifth.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SUPPORTING_PILLARS.map((pillar) => (
              <PillarCard key={pillar.title} pillar={pillar} />
            ))}
          </div>

          <div className="mt-4">
            <PillarCard pillar={CAPSTONE_PILLAR} highlight />
          </div>
        </motion.section>

        {/* Section 4 — The Paradigm Shift */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mt-16"
        >
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">The Paradigm Shift</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Most speed-reading courses train your eyes to move faster across a page. That&rsquo;s the wrong layer
              entirely — and it&rsquo;s why the &ldquo;speed&rdquo; always collapses the moment the material gets hard.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">The Old Way</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Mechanical Speed-Reading</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {OLD_WAY_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-6">
              <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">The Quantum Way</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Whole-Brain Development</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {QUANTUM_WAY_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-foreground">
            Speed isn&rsquo;t the goal — it&rsquo;s the byproduct. Once Focus, Visualization, Intuition, and Memory come
            online together, 600+ WPM stops being an effort and becomes your mind&rsquo;s natural resting pace.
          </p>
        </motion.section>

        {/* Section 5 — High-Converting Enrollment CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mt-16 flex flex-col items-center gap-6 text-center"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Quantum Mind Is Waiting to Be Unlocked.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            This is where conscious effort ends and Quantum Mind begins.
          </p>

          <motion.button
            type="button"
            onClick={onClaimAccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={cn(
              'group flex w-full max-w-md items-center justify-center gap-2 rounded-full px-8 py-5 sm:px-10',
              'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500',
              'text-base font-semibold text-white shadow-xl shadow-indigo-500/30 sm:text-lg',
              'transition-shadow duration-300 hover:shadow-2xl hover:shadow-teal-500/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            🔥 Claim My Full Quantum Mind Program Access
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.button>
        </motion.section>
      </div>
    </div>
  )
}
