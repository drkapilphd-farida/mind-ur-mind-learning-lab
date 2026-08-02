'use client'

import { useRouter } from 'next/navigation'
import { UnifiedQuantumSession } from './components/UnifiedQuantumSession'

// Standalone preview route for the Daily Quantum Session — a
// deliberately non-colliding sandbox, separate from both the
// discover-welcome-preview lead-magnet funnel and the real, still
// mid-development labs/quantum-speed-reading/start/* multi-page flow.
export default function UnifiedQuantumSessionPreviewPage(): React.JSX.Element {
  const router = useRouter()

  // The session's own streak/XP/WPM history is already persisted to
  // daily_quantum_sessions before this fires (see UnifiedQuantumSession's
  // handlePhase4Complete) — /dashboard is a Server Component that
  // re-queries that table fresh on every navigation (via
  // DailyQuantumSessionCard), so a plain router.push is enough for the
  // updated data to actually appear there; no client-side state needs to
  // be threaded through.
  return <UnifiedQuantumSession onReturnHome={() => router.push('/dashboard')} />
}
