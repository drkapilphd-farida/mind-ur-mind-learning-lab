'use client'

import { useState } from 'react'
import { Check, Lock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GOAL_COUNT = 3
const GOAL_PLACEHOLDERS = ['e.g. Finish today’s reading distraction-free', 'e.g. Reply to that one email', 'e.g. 10 minutes of real focus, no phone'] as const

type PowerThreeGoalsLockProps = {
  // Fires once, the moment the user locks their 3 goals — the parent
  // (PreSessionBriefingScreen) uses this to gate "Start Today's Session"
  // until goals are actually set, per the explicit "lock component ...
  // before starting their session" requirement. Session-local only — no
  // Server Action, no table. These are today's working priorities, not a
  // record worth persisting or reviewing later; if that changes, this is
  // the one place to add it.
  onLock: (goals: readonly [string, string, string]) => void
}

// Power-3 Daily Goals™ — a lightweight commitment device: naming exactly
// 3 priorities before the session starts, then locking them (no further
// edits) so today's focus is decided once, not renegotiated mid-session.
export function PowerThreeGoalsLock({ onLock }: PowerThreeGoalsLockProps): React.JSX.Element {
  const [goals, setGoals] = useState<string[]>(Array(GOAL_COUNT).fill(''))
  const [isLocked, setIsLocked] = useState(false)

  const canLock = goals.every((goal) => goal.trim().length > 0)

  function handleGoalChange(index: number, value: string): void {
    setGoals((current) => current.map((goal, i) => (i === index ? value : goal)))
  }

  function handleLock(): void {
    if (!canLock) return
    const trimmed = goals.map((goal) => goal.trim()) as [string, string, string]
    setIsLocked(true)
    onLock(trimmed)
  }

  if (isLocked) {
    return (
      <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left">
        <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest text-primary uppercase">
          <Lock className="size-3 shrink-0" aria-hidden="true" />
          Power-3 Goals — Locked In
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {goals.map((goal, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{goal.trim()}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card/60 p-4 text-left">
      <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        <Target className="size-3 shrink-0" aria-hidden="true" />
        Set Your Power-3 Goals for Today
      </p>
      <div className="mt-3 space-y-2.5">
        {goals.map((goal, index) => (
          <input
            key={index}
            type="text"
            value={goal}
            onChange={(event) => handleGoalChange(index, event.target.value)}
            placeholder={GOAL_PLACEHOLDERS[index]}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
          />
        ))}
      </div>
      <Button type="button" size="sm" className="mt-3 w-full rounded-full" disabled={!canLock} onClick={handleLock}>
        <Lock className="size-3.5" aria-hidden="true" />
        Lock In My Power-3 Goals
      </Button>
    </div>
  )
}
