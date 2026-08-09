'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { AIPresenceLogo } from './AIPresenceLogo'
import { HeroPromise } from './HeroPromise'
import { GatewayAuthModal } from './GatewayAuthModal'

// Immersive Onboarding Polish™ (Sprint LW-1C.3) — visually secondary
// "Coming Soon" previews of future learning sources, per the brief's
// Future Features section.
const FUTURE_LEARNING_SOURCES = [
  { emoji: '📺', label: 'YouTube & Learn' },
  { emoji: '🌐', label: 'Website & Learn' },
] as const

// One-Click Entry™ — this is now the app's real front door: `/welcome`
// redirects straight here (see welcome/page.tsx) and signUp.ts sends
// brand-new users here directly too. Arrival Experience™, Learning Goal™,
// and Discover Your Learning Potential™ are all deliberately no longer in
// the path — each remains fully intact at its own route (/welcome,
// /welcome/learning-goal, /discover-learning-potential) but unlinked from
// here, per the "hide from V1 UI, do not delete" precedent already used
// for Record & Learn™ (/welcome/record). Exactly two direct-action paths
// remain — Reading Training and Upload & Learn — each one click from a
// fresh signup to real content.
//
// Glass Premium™ — this screen now shares the exact glass/gradient/glow
// system built for /dashboard (globals.css's `.glass-premium*` classes,
// renamed from "Dashboard Glass" once this became its second screen — see
// that rename's own comment). Two things were deliberately NOT touched to
// keep the exception scoped exactly where asked:
//  - ArrivalBackground.tsx (still used by /welcome/learning-goal) is no
//    longer imported here — its own monochrome-only background is
//    replaced below by this screen's own ambient blob layer instead of
//    being recolored, since recoloring it would leak color into that
//    other screen too.
//  - PrimaryLearningMethodCard.tsx is a shared component (also used by
//    LearningGoalSelector.tsx) — rather than adding a glass variant to a
//    component with other consumers, the two cards below are bespoke
//    markup, matching the same glass-premium-card/-lift classes the
//    dashboard widgets use.
type ChooseLearningMethodExperienceProps = {
  isAuthenticated: boolean
}

type PathCardProps = {
  emoji: string
  title: string
  description: string
  points: readonly string[]
  ctaLabel: string
  onSelect: () => void
  // Visually distinguishes the Upload & Learn card as the hero of the two
  // — tokens only (border/shadow/type-scale), no new colors and no
  // permanent transform/scale (which would overlap its grid neighbor;
  // glass-premium-lift's own hover lift already covers motion).
  emphasized?: boolean
}

function PathCard({ emoji, title, description, points, ctaLabel, onSelect, emphasized = false }: PathCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'glass-premium-card glass-premium-lift group flex h-full flex-col items-center gap-5 px-10 py-12 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        emphasized && 'glass-premium-card--emphasized',
      )}
    >
      <span className={cn(emphasized ? 'text-7xl' : 'text-6xl')} aria-hidden="true">
        {emoji}
      </span>

      <div>
        <p className={cn(emphasized ? 'text-xl font-bold tracking-tight sm:text-2xl' : TYPOGRAPHY.h2)}>{title}</p>
        <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-3 text-muted-foreground')}>{description}</p>
      </div>

      <ul className="w-full max-w-xs space-y-2 text-left">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary/70" aria-hidden="true" />
            <span className={cn(TYPOGRAPHY.body, 'text-foreground/90')}>{point}</span>
          </li>
        ))}
      </ul>

      <p className="brand-gradient-text mt-auto pt-3 text-sm font-semibold">{ctaLabel}</p>
    </button>
  )
}

export function ChooseLearningMethodExperience({ isAuthenticated }: ChooseLearningMethodExperienceProps): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isExiting, setIsExiting] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<string | null>(null)

  // Every screen transition should feel connected — the card itself already
  // holds a brief selection glow (PrimaryLearningMethodCard's own 280ms
  // hold) before calling this; layering a short screen-level fade on top
  // avoids a hard cut to the next route, matching the pattern already used
  // by Arrival Experience™ and the AI Thinking screen.
  function handleSelect(path: string): void {
    if (!isAuthenticated) {
      setPendingDestination(path)
      return
    }
    if (prefersReducedMotion) {
      router.push(path)
      return
    }
    setIsExiting(true)
    window.setTimeout(() => router.push(path), 200)
  }

  return (
    <div className="glass-premium relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Ambient background — same technique as /dashboard: fixed so the
          blobs stay put regardless of scroll, -z-10 to sit behind
          everything. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glass-ambient-blob" style={{ width: 520, height: 520, top: '-15%', left: '-8%', background: 'var(--ambient-a)' }} />
        <div className="glass-ambient-blob" style={{ width: 460, height: 460, top: '20%', right: '-10%', background: 'var(--ambient-b)' }} />
        <div className="glass-ambient-blob" style={{ width: 380, height: 380, bottom: '-12%', left: '38%', background: 'var(--ambient-a)' }} />
      </div>

      <div className={cn('mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center transition-opacity duration-[250ms]', isExiting && 'opacity-0')}>
        <div className="flex flex-col items-center gap-3">
          <AIPresenceLogo size={84} />
          <p className="brand-gradient-text text-xl font-bold tracking-tight">Quantum Mind</p>
        </div>

        <div>
          <h1 className={TYPOGRAPHY.display}>Smart Reading &amp; Memory Trainer</h1>
          <HeroPromise className="mt-6" startDelayMs={200} />
        </div>

        <p className={TYPOGRAPHY.label}>Choose how you&rsquo;d like to start</p>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <PathCard
            emoji="🎯"
            title="Reading Training"
            description="Improve speed, focus and comprehension with 10-15 minutes of daily visual and reading exercises."
            points={['Schulte Grid, Word Flash, Chunk Reading', 'Guided Reading + Comprehension Test', '21-Day Progressive Program']}
            ctaLabel="Start Training →"
            onSelect={() => handleSelect('/labs/quantum-speed-reading/journey/1')}
          />
          <PathCard
            emoji="📄"
            title="Upload & Learn"
            description="Upload any PDF, notes or book. AI converts it into a clear summary, keywords, spider notes and practice questions."
            points={['Summary + Keywords', 'Spider Notes (Mind Map)', 'Recall Questions']}
            ctaLabel="Upload Document →"
            onSelect={() => handleSelect('/dashboard#upload-document')}
            emphasized
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-3 pt-2">
          {FUTURE_LEARNING_SOURCES.map((source) => (
            <div
              key={source.label}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-4 py-2 opacity-70 backdrop-blur-sm"
            >
              <span aria-hidden="true">{source.emoji}</span>
              <span className={TYPOGRAPHY.caption}>{source.label}</span>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          ))}
        </div>
      </div>

      <GatewayAuthModal
        open={pendingDestination !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDestination(null)
        }}
        next={pendingDestination ?? '/welcome/choose-method'}
      />
    </div>
  )
}
