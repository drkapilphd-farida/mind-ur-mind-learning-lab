'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { AppDomain } from '@/lib/domains/appDomain'
import { AIPresenceLogo } from './AIPresenceLogo'
import { GatewayAuthModal } from './GatewayAuthModal'

// Domain Split™ — this is the universal front door for BOTH
// habit.mindurmind.org.in and app.mindurmind.org.in (never gated by
// src/middleware.ts's DOMAIN_ROUTES), so it picks a distinct card set per
// domain rather than a fixed set. Habit domain keeps the single "21-Day
// Quantum Habit Journey" card (unchanged since the Quantum Mindset &
// Habit Builder™ Rebrand) — habit stays strictly single-option by
// product decision. App domain shows TWO cards: "Quantum Speed Reading"
// (pointing at the 30-Day Masterclass, not the habit-only journey route —
// /labs/quantum-speed-reading/journey/* is habit-only per middleware's
// DOMAIN_ROUTES, an app-domain visitor clicking through would just get
// bounced straight back) and "Upload & Learn" (→ /document-studio,
// app-only per the same DOMAIN_ROUTES). A prior sprint (Upload & Learn
// Masterclass Integration™) had removed this second card in favor of
// folding upload into the masterclass curriculum; restored here as a
// deliberate reversal for app.mindurmind.org.in only — habit still never
// shows it.
//
// This screen deliberately does NOT reuse the shared HeroPromise
// component (its own doc comment locks its 3 lines verbatim and it has
// two other real consumers — ArrivalExperience.tsx, ProcessingExperience.tsx
// — that must keep their original copy) — the subheadings below are
// bespoke to this screen only, matching HeroPromise's type scale for
// visual consistency without touching that shared, locked component.
//
// Glass Premium™ — this screen shares the exact glass/gradient/glow
// system built for /dashboard (globals.css's `.glass-premium*` classes).
// ArrivalBackground.tsx (still used by /welcome/learning-goal) is no
// longer imported here — its own monochrome-only background is replaced
// below by this screen's own ambient blob layer instead of being
// recolored, since recoloring it would leak color into that other screen
// too.
type ChooseLearningMethodExperienceProps = {
  isAuthenticated: boolean
  appDomain: AppDomain
}

type PathCardProps = {
  emoji: string
  title: string
  description: string
  points: readonly string[]
  ctaLabel: string
  onSelect: () => void
}

function PathCard({ emoji, title, description, points, ctaLabel, onSelect }: PathCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="glass-premium-card glass-premium-lift group flex h-full w-full flex-col items-center gap-5 px-10 py-12 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="text-6xl" aria-hidden="true">
        {emoji}
      </span>

      <div>
        <p className={TYPOGRAPHY.h2}>{title}</p>
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

export function ChooseLearningMethodExperience({ isAuthenticated, appDomain }: ChooseLearningMethodExperienceProps): React.JSX.Element {
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

        {appDomain === 'habit' ? (
          <div>
            <h1 className={TYPOGRAPHY.display}>Quantum Mindset &amp; Habit Builder</h1>
            <p className="mt-6 flex flex-col gap-1 text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl md:text-4xl">
              <span>Rewire your brain.</span>
              <span>Build unbreakable habits.</span>
              <span>Unlock your true potential in just 10 minutes a day.</span>
            </p>
          </div>
        ) : (
          <div>
            <h1 className={TYPOGRAPHY.display}>Read 5x Faster. Retain 100%.</h1>
            <p className="mt-6 flex flex-col gap-1 text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl md:text-4xl">
              <span>Master Any Book — Guided Live by Dr. Kapil Dev Sharma.</span>
              <span>7 Live Masterclasses. One Mentor.</span>
              <span>Real Transformation.</span>
            </p>
          </div>
        )}

        <div className="flex w-full justify-center">
          {appDomain === 'habit' ? (
            <div className="w-full max-w-sm">
              <PathCard
                emoji="🎯"
                title="21-Day Quantum Habit Journey"
                description="Transform your mindset with daily cognitive drills, visualization, and habit-building exercises."
                points={['Daily Mindset & Focus Drills', 'Guided Breathing & Visualization', '21-Day Progressive Habit Loop']}
                ctaLabel="Start Training →"
                onSelect={() => handleSelect('/labs/quantum-speed-reading/journey/1')}
              />
            </div>
          ) : (
            <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
              <PathCard
                emoji="⚡"
                title="Quantum Speed Reading"
                description="A real, structured 30-day mastery program — guided live by Dr. Kapil Dev Sharma."
                points={['Peripheral Vision Activator, Rapid Recognition Drill, Quantum Chunk Reading', '7 Live Masterclasses with Dr. Kapil Dev Sharma']}
                ctaLabel="Start Training →"
                onSelect={() => handleSelect('/labs/quantum-speed-reading/thirty-day-curriculum')}
              />
              <PathCard
                emoji="📄"
                title="Upload & Learn"
                description="Turn any PDF or textbook into instant speed-reading drills, mind maps, and smart summaries."
                points={['AI-Generated Speed Reading Drills', 'Neural Mind Maps & Smart Summaries', 'Works With Any PDF or Textbook']}
                ctaLabel="Upload & Learn →"
                onSelect={() => handleSelect('/document-studio')}
              />
            </div>
          )}
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
