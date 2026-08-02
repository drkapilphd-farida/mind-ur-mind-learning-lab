import type { Metadata } from 'next'
import { MemoryProgressDashboard } from '@/features/memory-mode-runtime/dashboard'

export const metadata: Metadata = {
  title: 'Memory Progress',
}

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. The real Memory
// Progress Dashboard route — a flat, learner-scoped page sibling to
// `/preview/dashboard`/`/preview/profile`, not nested under a specific
// `/preview/learning-projects/[id]/...`, since this dashboard aggregates
// across every document a learner has run a memory session against
// (`getMemoryAnalyticsDashboard` takes no document id). Renders inside
// the normal app chrome — unlike the immersive `/memory` session
// workspace, a dashboard genuinely benefits from the sidebar/nav staying
// visible, so `AppShell.tsx`'s `IMMERSIVE_ROUTE_PATTERNS` is intentionally
// left untouched this sprint.
export default async function MemoryInsightsPage(): Promise<React.JSX.Element> {
  return <MemoryProgressDashboard />
}
