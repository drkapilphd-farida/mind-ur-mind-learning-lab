'use client'

import { useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

type MandalaDevPanelProps = {
  devBypassLocks: boolean
  onToggleBypassLocks: (value: boolean) => void
  onReset: () => void
  onJumpToLevel: (order: number) => void
  onClearSession: () => void
  onCompleteMission: () => void
  canRandomAnswers: boolean
  onRandomAnswers: () => void
  onGoToReport: () => void
}

// Developer Testing Panel — only ever rendered by the caller when
// process.env.NODE_ENV === 'development'; Next.js statically replaces
// NODE_ENV at build time, so the branch that renders this component is
// dead-code-eliminated from production bundles entirely, not just hidden.
// "Unlock All Levels" and "Ignore Lock Rules" share one underlying toggle —
// both describe the same effect (bypass the sequential lock check when
// selecting a level), so there's no distinct second behavior to implement.
//
// Mounted client-side only: Radix's Switch renders its hidden bubble
// <input> with slightly different inline styles between the server-rendered
// pass and client hydration (an upstream SSR/CSR quirk), which otherwise
// produces a hydration mismatch warning. A dev-only panel has no reason to
// be part of the server-rendered HTML in the first place, so gating it
// behind a mount check avoids the mismatch at its source.
export function MandalaDevPanel({
  devBypassLocks,
  onToggleBypassLocks,
  onReset,
  onJumpToLevel,
  onClearSession,
  onCompleteMission,
  canRandomAnswers,
  onRandomAnswers,
  onGoToReport,
}: MandalaDevPanelProps): React.JSX.Element | null {
  const [hasMounted, setHasMounted] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isCompletingMission, setIsCompletingMission] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleReset = (): void => {
    setIsResetting(true)
    onReset()
  }

  const handleCompleteMission = (): void => {
    setIsCompletingMission(true)
    onCompleteMission()
  }

  if (!hasMounted) return null

  return (
    <div className="fixed bottom-4 left-4 z-[60] w-72 rounded-2xl border border-warning/30 bg-card p-4 shadow-lg">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-warning uppercase">
        <FlaskConical className="size-3.5" aria-hidden="true" />
        Developer Testing Panel
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm text-foreground">Unlock All Levels</span>
        <Switch checked={devBypassLocks} onCheckedChange={onToggleBypassLocks} aria-label="Unlock all levels" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm text-foreground">Ignore Lock Rules</span>
        <Switch checked={devBypassLocks} onCheckedChange={onToggleBypassLocks} aria-label="Ignore lock rules" />
      </div>

      <div className="mt-3">
        <span className="text-sm text-foreground">Jump to Level</span>
        <div className="mt-1.5 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((order) => (
            <Button key={order} variant="outline" size="sm" className="flex-1" onClick={() => onJumpToLevel(order)}>
              {order}
            </Button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onClearSession}>
        Clear Session
      </Button>

      <Button variant="outline" size="sm" className="mt-2 w-full" disabled={!canRandomAnswers} onClick={onRandomAnswers}>
        Random Answers
      </Button>

      <Button variant="outline" size="sm" className="mt-2 w-full" disabled={isCompletingMission} onClick={handleCompleteMission}>
        {isCompletingMission ? 'Completing…' : 'Complete Mission'}
      </Button>

      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={onGoToReport}>
        Go To Report
      </Button>

      <Button variant="destructive" size="sm" className="mt-2 w-full" disabled={isResetting} onClick={handleReset}>
        {isResetting ? 'Resetting…' : 'Reset Mission'}
      </Button>

      <p className="mt-2 text-[10px] text-muted-foreground">Development only — never shown in production builds.</p>
    </div>
  )
}
