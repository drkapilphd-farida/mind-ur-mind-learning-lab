'use client'

import { useEffect, useState } from 'react'
import { Coffee, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatElapsedDuration } from '@/features/learning-mode-runtime/presentation/formatSessionDuration'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'
import { pauseFocusSession } from '../actions/pauseFocusSession'
import { resumeFocusSession } from '../actions/resumeFocusSession'
import { POMODORO_WORK_MINUTES, POMODORO_BREAK_MINUTES } from '../types/FocusVariant'

type PomodoroPhase = 'work' | 'break'

type PomodoroTimerProps = {
  sessionId: string
  sessionStatus: SessionSnapshot['status']
  runAction: (action: () => Promise<ModeSessionActionResult>) => void
}

// Focus Mode™ (Mini) Sprint ALS-16 — Pomodoro Mode's real work/break
// cycling. Founder-confirmed (via AskUserQuestion): transitions fire
// automatically, by calling this session's own real, existing
// `pauseFocusSession`/`resumeFocusSession` actions — the same ones a
// learner's own manual Pause/Continue click already calls. No second,
// competing pause/resume mechanic invented for Pomodoro specifically.
//
// `phase` is always *derived* from the real, persisted `sessionStatus`
// (via the resync effect below), never mutated directly by the countdown
// itself — the countdown only ever calls the real action; it's the
// resulting real status change that flips `phase`, once it comes back.
// This means a learner who manually clicks Continue/Pause mid-cycle is
// always respected: the local phase resyncs to match, and no redundant or
// invalid action ever fires against a session already in that state.
//
// Phase and its own start time are deliberately client-only, ephemeral
// state — there is no real "on a break" concept in LSE-1/LSE-2 to persist
// it against (a break is not a session status; only the surrounding
// auto-pause is real and persisted). A page refresh mid-cycle honestly
// lands back on the session's real `active`/`paused` status via the same
// resume path every other mode already uses (`continueFocusSession`
// auto-un-pauses on return, exactly like Reading/Memory), and this
// component starts that phase's countdown fresh — never a fabricated
// reconstruction of exactly how far into a phase the learner was.
export function PomodoroTimer({ sessionId, sessionStatus, runAction }: PomodoroTimerProps): React.JSX.Element {
  const [phase, setPhase] = useState<PomodoroPhase>(sessionStatus === 'paused' ? 'break' : 'work')
  const [phaseStartedAt, setPhaseStartedAt] = useState(() => Date.now())
  const [remainingSeconds, setRemainingSeconds] = useState((phase === 'work' ? POMODORO_WORK_MINUTES : POMODORO_BREAK_MINUTES) * 60)

  useEffect(() => {
    setPhase(sessionStatus === 'paused' ? 'break' : 'work')
    setPhaseStartedAt(Date.now())
  }, [sessionStatus])

  useEffect(() => {
    const phaseDurationSeconds = (phase === 'work' ? POMODORO_WORK_MINUTES : POMODORO_BREAK_MINUTES) * 60
    let hasTransitioned = false

    function tick(): void {
      const elapsedSeconds = Math.floor((Date.now() - phaseStartedAt) / 1000)
      const remaining = Math.max(0, phaseDurationSeconds - elapsedSeconds)
      setRemainingSeconds(remaining)

      if (remaining === 0 && !hasTransitioned) {
        hasTransitioned = true
        if (phase === 'work') runAction(() => pauseFocusSession(sessionId))
        else runAction(() => resumeFocusSession(sessionId))
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [phase, phaseStartedAt, sessionId, runAction])

  const isBreak = phase === 'break'

  return (
    <Badge variant="secondary" className="gap-1.5" aria-label={`${isBreak ? 'Break' : 'Focus'} interval, ${formatElapsedDuration(remainingSeconds)} remaining`}>
      {isBreak ? <Coffee className={ICON_SIZE.sm} aria-hidden="true" /> : <Flame className={ICON_SIZE.sm} aria-hidden="true" />}
      {isBreak ? 'Break' : 'Focus'} — {formatElapsedDuration(remainingSeconds)}
    </Badge>
  )
}
