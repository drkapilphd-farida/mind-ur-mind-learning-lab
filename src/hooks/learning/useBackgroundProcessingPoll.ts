'use client'

import { useEffect, useRef, useState } from 'react'
import { pollBackgroundProcessing, type BackgroundProcessingSnapshot } from '@/app/preview/learning-projects/[id]/actions'
import type { DocumentStatus } from '@/types/documents'

const POLL_INTERVAL_MS = 4000

type UseBackgroundProcessingPollResult = {
  snapshot: BackgroundProcessingSnapshot | null
  isPolling: boolean
}

// ALS-15 Instant Learning Engine™ — the client half of the approved
// "client-paced poll/pump" design. Only ever polls a document sitting at
// `'workspace_ready'` — a document that's already fully `'ready'` (or
// `'failed'`/`'processing'`) needs no poll at all, matching this
// project's "never show progress for something already done" discipline.
// Pauses while the tab is backgrounded (no point spending Claude calls on
// a tab nobody's looking at) and stops permanently once a terminal status
// is reached. Mounts in two places: the Phase 1 processing screen doesn't
// need this at all (it auto-navigates once Phase 1 finishes); this hook
// is for the workspace/detail page, which resumes Phase 3 on every later
// visit while it's incomplete.
export function useBackgroundProcessingPoll(documentId: string, initialStatus: DocumentStatus, intervalMs: number = POLL_INTERVAL_MS): UseBackgroundProcessingPollResult {
  const [snapshot, setSnapshot] = useState<BackgroundProcessingSnapshot | null>(null)
  const [isPolling, setIsPolling] = useState(initialStatus === 'workspace_ready')
  const isDoneRef = useRef(initialStatus !== 'workspace_ready')

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

      const result = await pollBackgroundProcessing(documentId)
      if (cancelled) return

      if (result.success) {
        setSnapshot(result.snapshot)
        if (result.snapshot.status === 'ready' || result.snapshot.status === 'failed') {
          isDoneRef.current = true
          setIsPolling(false)
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
  }, [documentId, intervalMs])

  return { snapshot, isPolling }
}
