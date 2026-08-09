'use client'

import { useRouter } from 'next/navigation'
import { UnifiedQuantumSession } from './UnifiedQuantumSession'

type UnifiedQuantumSessionPreviewClientProps = {
  isPro: boolean
  userId: string
  mindScore: number
}

// Thin client boundary — page.tsx (Server Component) resolves isPro/
// mindScore server-side and hands them down here unchanged; this file
// exists only because useRouter needs a Client Component.
export function UnifiedQuantumSessionPreviewClient({ isPro, userId, mindScore }: UnifiedQuantumSessionPreviewClientProps): React.JSX.Element {
  const router = useRouter()

  // The session's own streak/XP/WPM history is already persisted to
  // daily_quantum_sessions before this fires (see UnifiedQuantumSession's
  // handlePhase4Complete/finalizeCircuitWithoutRetention) — /dashboard is
  // a Server Component that re-queries that table fresh on every
  // navigation, so a plain router.push is enough for the updated data to
  // actually appear there; no client-side state needs to be threaded
  // through.
  return <UnifiedQuantumSession isPro={isPro} userId={userId} mindScore={mindScore} onReturnHome={() => router.push('/dashboard')} />
}
