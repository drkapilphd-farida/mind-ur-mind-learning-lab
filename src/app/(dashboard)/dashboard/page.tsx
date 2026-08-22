import type { Metadata } from 'next'
import { getAppDomain } from '@/lib/domains/appDomain'
import { HabitDashboard } from './HabitDashboard'
import { QsrDashboard } from './QsrDashboard'

export const metadata: Metadata = {
  title: 'Transformation Dashboard',
}

// Paste URL / YouTube™ — a Server Action invoked from this page
// (importQuantumDocumentFromUrl, called by AIDocumentTransformerWidget,
// QsrDashboard-only) inherits ITS route's own maxDuration, not one it
// could export itself ("use server" files may only export async
// functions). A page fetch (website or YouTube watch page + transcript)
// plus one Claude call plus a DB insert needs the same real room as the
// sibling file-upload Route Handler's own `maxDuration = 60`
// (/api/quantum-documents/transform). Harmless to keep on this shared
// route for the habit-domain render too, which never invokes that action.
export const maxDuration = 60

// Domain Split™ — habit.mindurmind.org.in and app.mindurmind.org.in share
// this one route (/dashboard); src/middleware.ts resolves which domain
// served the request and forwards it via a request header, read here via
// getAppDomain() to pick which dashboard actually renders. See
// src/lib/domains/appDomain.ts and HabitDashboard.tsx/QsrDashboard.tsx.
export default async function TransformationDashboard(): Promise<React.JSX.Element> {
  const appDomain = await getAppDomain()
  return appDomain === 'habit' ? <HabitDashboard /> : <QsrDashboard />
}
