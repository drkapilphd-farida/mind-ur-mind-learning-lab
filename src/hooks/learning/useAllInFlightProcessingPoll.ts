'use client'

import { useEffect, useRef, useState } from 'react'
import { pollAllInFlightProcessing } from '@/lib/processing/pollAllInFlightProcessing'

const POLL_INTERVAL_MS = 4000

type UseAllInFlightProcessingPollResult = {
  inFlightCount: number | null
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 2 — the same
// real "client-paced poll/pump" design useBackgroundProcessingPoll.ts
// already established (same interval, same tab-visibility pause), just
// mounted somewhere broader than one specific project's own detail page
// so ANY of a signed-in user's in-flight documents keeps advancing
// whenever they have this page open, not only the one document whose
// own page happens to be open. Stops permanently once a poll reports
// zero real in-flight documents — never polls forever with nothing to
// do.
export function useAllInFlightProcessingPoll(enabled: boolean, intervalMs: number = POLL_INTERVAL_MS): UseAllInFlightProcessingPollResult {
  const [inFlightCount, setInFlightCount] = useState<number | null>(null)
  const isDoneRef = useRef(!enabled)

  useEffect(() => {
    if (isDoneRef.current) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function tick(): Promise<void> {
      if (cancelled || isDoneRef.current) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        scheduleNext()
        return
      }

      const result = await pollAllInFlightProcessing()
      if (cancelled) return

      if (result.success) {
        setInFlightCount(result.inFlightCount)
        if (result.inFlightCount === 0) {
          isDoneRef.current = true
          return
        }
      }

      scheduleNext()
    }

    function scheduleNext(): void {
      if (cancelled || isDoneRef.current) return
      timer = setTimeout(() => void tick(), intervalMs)
    }

    void tick()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [intervalMs])

  return { inFlightCount }
}
