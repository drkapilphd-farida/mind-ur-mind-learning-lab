import type { Metadata } from 'next'
import { SmartNotesProgressDashboard } from '@/features/smart-notes-runtime/dashboard'

export const metadata: Metadata = {
  title: 'Smart Notes Progress',
}

// Smart Notes™ Sprint-4 — Analytics & Insights™. A flat, learner-scoped
// route sibling to `/preview/memory-insights`, not nested under
// `/preview/learning-projects/[id]/...`, since this dashboard aggregates
// across every document a learner has run a smart notes session
// against (`getSmartNotesAnalyticsDashboard` takes no document id).
// Renders inside the normal app chrome — `AppShell.tsx`'s
// `IMMERSIVE_ROUTE_PATTERNS` is intentionally left untouched, exactly as
// it was for Memory's own `/memory-insights` route.
export default async function SmartNotesInsightsPage(): Promise<React.JSX.Element> {
  return <SmartNotesProgressDashboard />
}
