'use client'

import { useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CandleTratakDevPanelProps = {
  onReplay: () => void
  onGenerateReport: () => void
  onResetSession: () => void
}

// Developer Testing Panel — only ever rendered when
// process.env.NODE_ENV === 'development'; dead-code-eliminated from
// production bundles entirely, same precedent as the other 2 dev panels.
export function CandleTratakDevPanel({ onReplay, onGenerateReport, onResetSession }: CandleTratakDevPanelProps): React.JSX.Element | null {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <div className="fixed bottom-4 left-4 z-[60] w-72 rounded-2xl border border-warning/30 bg-card p-4 shadow-lg">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-warning uppercase">
        <FlaskConical className="size-3.5" aria-hidden="true" />
        Developer Testing Panel
      </div>

      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onReplay}>
        Replay
      </Button>
      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={onGenerateReport}>
        Generate Report
      </Button>
      <Button variant="destructive" size="sm" className="mt-2 w-full" onClick={onResetSession}>
        Reset Session
      </Button>

      <p className="mt-2 text-[10px] text-muted-foreground">Development only — never shown in production builds.</p>
    </div>
  )
}
