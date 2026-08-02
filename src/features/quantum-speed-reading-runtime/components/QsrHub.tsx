'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { SessionTimer } from '@/features/learning-mode-runtime/components'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { resolveSpeedLadderLevel } from '../presentation/resolveSpeedLadderLevel'
import type { QsrModeId, QsrModeRecommendation } from '../presentation/recommendQsrMode'
import type { ReadingConfidenceLevel } from '../presentation/resolveReadingConfidence'
import type { ReadingSpeedSample } from '../actions/getReadingSpeedHistory'

// Sprint-1 Hub Polish — each mode's own personality, expressed only
// through the same three meaningful colors the locked brief already
// assigns ("color communicates meaning, never decorates"): Green =
// Progress, Blue (this app's `primary`) = Focus, Orange (`warning`) =
// Challenge. Presence Reading stays neutral on purpose — it is the one
// mode that asks for nothing, not even focus.
type QsrModeAccent = 'neutral' | 'focus' | 'challenge' | 'progress'

type QsrModeCard = {
  id: QsrModeId
  emoji: string
  label: string
  purpose: string
  estimatedDuration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  accent: QsrModeAccent
}

const ACCENT_CLASSES: Record<QsrModeAccent, string> = {
  neutral: 'bg-muted text-muted-foreground',
  focus: 'bg-primary/10 text-primary',
  challenge: 'bg-warning/10 text-warning',
  progress: 'bg-success/10 text-success',
}

// Real, fixed editorial metadata about each mode itself — never data
// about the learner. Ordering matches the brief's own locked Hub list.
const QSR_MODE_CARDS: readonly QsrModeCard[] = [
  { id: 'presence', emoji: '🌱', label: 'Presence Reading', purpose: 'Calm your mind before you read.', estimatedDuration: '~1 min', difficulty: 'Easy', accent: 'neutral' },
  { id: 'smart-chunk', emoji: '📖', label: 'Smart Chunk Reading', purpose: 'Read in natural, intelligent groups.', estimatedDuration: '~3–5 min', difficulty: 'Moderate', accent: 'focus' },
  { id: 'guided-eye-flow', emoji: '👀', label: 'Guided Eye Flow', purpose: 'Let your eyes flow naturally forward.', estimatedDuration: '~3–5 min', difficulty: 'Moderate', accent: 'focus' },
  { id: 'sprint', emoji: '⚡', label: 'Reading Sprint', purpose: 'A short, focused reading challenge.', estimatedDuration: '30–90 sec', difficulty: 'Challenging', accent: 'challenge' },
  { id: 'comprehension-check', emoji: '🧠', label: 'Comprehension Check', purpose: 'See what you remembered.', estimatedDuration: '~2 min', difficulty: 'Moderate', accent: 'focus' },
  { id: 'speed-ladder', emoji: '🚀', label: 'Speed Ladder', purpose: 'Track your real reading progress.', estimatedDuration: '~1 min', difficulty: 'Easy', accent: 'progress' },
  // Reading Intelligence Engine™ Upgrade — Sprint-4. The one new,
  // additive mode this sprint adds — everything above is unmodified.
  {
    id: 'intelligent-reading',
    emoji: '🧭',
    label: 'Intelligent Reading',
    purpose: 'A guided journey that prepares your brain before you read.',
    estimatedDuration: '~4–6 min',
    difficulty: 'Moderate',
    accent: 'focus',
  },
]

const MODE_LABEL: Record<QsrModeId, string> = {
  sequential: 'Continue Reading',
  presence: 'Presence Reading',
  'smart-chunk': 'Smart Chunk Reading',
  'guided-eye-flow': 'Guided Eye Flow',
  sprint: 'Reading Sprint',
  'comprehension-check': 'Comprehension Check',
  'speed-ladder': 'Speed Ladder',
  'intelligent-reading': 'Intelligent Reading',
}

const CONFIDENCE_LABEL: Record<ReadingConfidenceLevel, string> = { low: 'Low', medium: 'Medium', high: 'High' }

type QsrHubProps = {
  activeMode: QsrModeId
  recommendation: QsrModeRecommendation
  onSelectMode: (mode: QsrModeId) => void
  currentWpm: number | null
  samples: readonly ReadingSpeedSample[]
  todaysSessionCount: number
  streak: number
  completionPercentage: number
  sessionStartedAt: string | null
  confidence: ReadingConfidenceLevel
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function resolveCardStatus(modeId: QsrModeId, activeMode: QsrModeId, recommendedModeId: QsrModeId, samples: readonly ReadingSpeedSample[]): { label: string; status: 'active' | 'completed' | 'pending' } {
  if (modeId === activeMode) return { label: 'In Progress', status: 'active' }

  const modeSamples = samples.filter((sample) => sample.mode === modeId)
  if (modeSamples.length > 0) {
    const now = new Date()
    const completedToday = modeSamples.some((sample) => isSameCalendarDay(new Date(sample.recordedAt), now))
    return completedToday ? { label: 'Completed Today', status: 'completed' } : { label: 'Completed Earlier', status: 'completed' }
  }

  if (modeId === recommendedModeId) return { label: 'Recommended', status: 'pending' }
  return { label: 'Available', status: 'pending' }
}

// Quantum Speed Reading Hub Experience™ (Sprint-1). The premium reading
// training dashboard — real hierarchy, real numbers throughout, no
// fabricated stat. Reachable above the chapter at all times (never a
// one-time gate, never forcing sequential completion), except in Focus
// Mode, which already hides every other piece of secondary chrome the
// same way (see ReadingWorkspace.tsx).
export function QsrHub({ activeMode, recommendation, onSelectMode, currentWpm, samples, todaysSessionCount, streak, completionPercentage, sessionStartedAt, confidence }: QsrHubProps): React.JSX.Element {
  const [showModeGrid, setShowModeGrid] = useState(false)
  const { level } = resolveSpeedLadderLevel(currentWpm ?? 0)

  return (
    <div className="space-y-7 rounded-2xl border border-border bg-card/60 p-5 sm:p-8">
      {/* 1. Identity */}
      <p className={cn(TYPOGRAPHY.label, 'text-muted-foreground')}>Quantum Speed Reading™</p>

      {/* 2. Reading Progress — WPM is the visual hero: the single
          largest, most confident number on the Hub. Level and Today's
          Goal ride quietly beneath it as secondary context, never
          competing with it for attention. */}
      <div className="flex flex-col items-center gap-3 py-1 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <p className={cn(TYPOGRAPHY.display, 'tabular-nums leading-none text-foreground')}>{currentWpm ?? '—'}</p>
          {currentWpm !== null && <p className={cn(TYPOGRAPHY.h3, 'text-muted-foreground')}>WPM</p>}
        </div>
        {currentWpm === null && <p className={TYPOGRAPHY.caption}>No reading speed recorded yet</p>}
        <div className="flex items-center gap-4">
          <span className={cn(TYPOGRAPHY.caption, 'rounded-full bg-muted px-2.5 py-1')}>Level {level}</span>
          <span className={cn(TYPOGRAPHY.caption, 'rounded-full bg-muted px-2.5 py-1')}>Today&rsquo;s Goal: {MODE_LABEL[recommendation.modeId]}</span>
        </div>
      </div>

      {/* 3. AI Recommendation — the one thing a learner needs to decide
          within 5 seconds: what to do next, and one obvious way to do it. */}
      <div className="animate-in fade-in space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-5 duration-(--duration-base)">
        <p className={cn(TYPOGRAPHY.label, 'text-primary')}>⭐ AI Recommendation</p>
        <p className={TYPOGRAPHY.body}>{recommendation.reason}</p>
        {recommendation.estimatedImprovementWpm !== null && (
          <p className={cn(TYPOGRAPHY.caption, 'font-medium text-success')}>Estimated Improvement +{recommendation.estimatedImprovementWpm} WPM</p>
        )}
        <div className="space-y-2 pt-1">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => onSelectMode(recommendation.modeId)}>
            Start Recommended Mode
          </Button>
          <button
            type="button"
            onClick={() => setShowModeGrid((current) => !current)}
            className={cn(TYPOGRAPHY.caption, 'block text-muted-foreground underline underline-offset-4 hover:text-foreground')}
          >
            Choose Another Mode
          </button>
        </div>
      </div>

      {/* 4. Reading Modes grid — each card's own personality lives only
          in its icon badge's color, the same meaningful Green/Blue/
          Orange the rest of the Hub uses, never a full-card color flood. */}
      {showModeGrid && (
        <div className="animate-in fade-in grid grid-cols-1 gap-3 duration-(--duration-base) sm:grid-cols-2 lg:grid-cols-3">
          {QSR_MODE_CARDS.map((mode) => {
            const card = resolveCardStatus(mode.id, activeMode, recommendation.modeId, samples)
            const isRecommended = mode.id === recommendation.modeId
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={cn(
                  'flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all duration-(--duration-fast) ease-in-out hover:-translate-y-0.5 hover:shadow-md',
                  card.status === 'active' ? 'border-primary bg-primary/5' : 'border-border',
                  isRecommended && card.status !== 'active' && 'ring-1 ring-primary/40',
                )}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span aria-hidden="true" className={cn('flex size-10 items-center justify-center rounded-full text-xl', ACCENT_CLASSES[mode.accent])}>
                    {mode.emoji}
                  </span>
                  <StatusBadge status={card.status === 'active' ? 'active' : card.status === 'completed' ? 'completed' : 'pending'} label={card.label} />
                </div>
                <p className={TYPOGRAPHY.h4}>{mode.label}</p>
                <p className={cn(TYPOGRAPHY.caption, 'text-muted-foreground')}>{mode.purpose}</p>
                <div className="flex gap-3">
                  <p className={TYPOGRAPHY.caption}>{mode.estimatedDuration}</p>
                  <p className={TYPOGRAPHY.caption}>{mode.difficulty}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 5. Your Progress panel */}
      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <p className={TYPOGRAPHY.caption}>Reading Time</p>
          {sessionStartedAt !== null ? <SessionTimer startedAt={sessionStartedAt} /> : <p className={TYPOGRAPHY.small}>—</p>}
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Today&rsquo;s Sessions</p>
          <p className={cn(TYPOGRAPHY.small, 'tabular-nums')}>{todaysSessionCount}</p>
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Completion</p>
          <p className={cn(TYPOGRAPHY.small, 'tabular-nums text-success')}>{completionPercentage}%</p>
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Current Streak</p>
          <p className={cn(TYPOGRAPHY.small, 'tabular-nums')}>
            {streak} day{streak === 1 ? '' : 's'}
          </p>
        </div>
        <div>
          <p className={TYPOGRAPHY.caption}>Reading Confidence</p>
          <p className={TYPOGRAPHY.small}>{CONFIDENCE_LABEL[confidence]}</p>
        </div>
      </div>
    </div>
  )
}
