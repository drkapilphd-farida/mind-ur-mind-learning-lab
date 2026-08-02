'use client'

import { useAllInFlightProcessingPoll } from '@/hooks/learning/useAllInFlightProcessingPoll'

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. Objective 2 — mounted once
// on the dashboard (the page a signed-in user visits far more often, and
// keeps open far longer, than any one specific project's own detail
// page), this is a pure background side effect: it renders nothing and
// changes nothing visually (per this sprint's own "not a UI redesign"
// scope) — it only keeps every in-flight document's real Background
// Intelligence advancing for as long as the dashboard tab stays open.
export function DashboardBackgroundProcessingPoller(): null {
  useAllInFlightProcessingPoll(true)
  return null
}
