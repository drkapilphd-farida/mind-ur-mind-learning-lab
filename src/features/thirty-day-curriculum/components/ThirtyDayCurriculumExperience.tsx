'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CurriculumAssessmentCanvas } from './CurriculumAssessmentCanvas'
import { ThirtyDayCurriculumDayDetail } from './ThirtyDayCurriculumDayDetail'
import { ThirtyDayCurriculumOverview } from './ThirtyDayCurriculumOverview'
import { TOTAL_CURRICULUM_DAYS } from '../curriculumDatabase'
import { loadCurriculumProgress, markCurriculumDayComplete, recordCurriculumCheckpoint, type CurriculumCheckpointResult } from '../curriculumProgress'

type CurriculumView = 'overview' | 'day-detail' | 'assessment'

function getMostRecentTrueWpm(day: number): number | null {
  const progress = loadCurriculumProgress()
  const priorCheckpoints = Object.values(progress.checkpoints)
    .filter((checkpoint) => checkpoint.day < day)
    .sort((a, b) => b.day - a.day)
  return priorCheckpoints[0]?.trueWpm ?? null
}

function parseValidDay(rawDay: string | null): number | null {
  if (rawDay === null) return null
  const day = Number(rawDay)
  return Number.isInteger(day) && day >= 1 && day <= TOTAL_CURRICULUM_DAYS ? day : null
}

// Root client orchestrator — a single route, client-state-driven view
// machine (Overview <-> Day Detail <-> Assessment) rather than per-day
// dynamic routes, mirroring QuantumJourneySession.tsx's own
// local-`level`-state approach. `refreshKey` forces the Overview to
// re-read localStorage after any mutation (mark-complete or a recorded
// checkpoint) without needing a shared store — the same "bump a key to
// force a re-read" trick this project already uses wherever a sibling
// component owns the write.
//
// Immersive Daily Session Playlist™ — this is also the landing point a
// real browser navigation returns to after DaySessionRunner sends the
// learner out to an exercise's own route: curriculumReturnRouting.ts
// encodes `?view=day&day=N[&dayComplete=1]` into the URL it redirects
// back to, and the initial view state here is derived from those params
// (read once, on mount) so the day view — and, on the playlist's final
// exercise, the completion celebration — survives the real page
// navigation a client-only React state machine otherwise couldn't.
export function ThirtyDayCurriculumExperience(): React.JSX.Element {
  const searchParams = useSearchParams()
  const initialDay = searchParams.get('view') === 'day' ? parseValidDay(searchParams.get('day')) : null

  const [view, setView] = useState<CurriculumView>(initialDay !== null ? 'day-detail' : 'overview')
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDay)
  const [justCompletedDay, setJustCompletedDay] = useState(initialDay !== null && searchParams.get('dayComplete') === '1')
  const [refreshKey, setRefreshKey] = useState(0)
  const [progress, setProgress] = useState(() => loadCurriculumProgress())

  function refreshProgress(): void {
    setProgress(loadCurriculumProgress())
    setRefreshKey((key) => key + 1)
  }

  function handleSelectDay(day: number): void {
    setSelectedDay(day)
    setJustCompletedDay(false)
    setView('day-detail')
  }

  function handleBackToOverview(): void {
    refreshProgress()
    setView('overview')
    setSelectedDay(null)
    setJustCompletedDay(false)
  }

  function handleMarkComplete(day: number): void {
    markCurriculumDayComplete(day)
    refreshProgress()
  }

  function handleLaunchAssessment(day: number): void {
    setSelectedDay(day)
    setView('assessment')
  }

  function handleAssessmentComplete(result: CurriculumCheckpointResult): void {
    recordCurriculumCheckpoint(result)
    refreshProgress()
    setView('day-detail')
  }

  if (view === 'assessment' && selectedDay !== null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <CurriculumAssessmentCanvas day={selectedDay} mostRecentTrueWpm={getMostRecentTrueWpm(selectedDay)} onComplete={handleAssessmentComplete} />
      </div>
    )
  }

  if (view === 'day-detail' && selectedDay !== null) {
    return (
      <ThirtyDayCurriculumDayDetail
        day={selectedDay}
        progress={progress}
        justCompletedDay={justCompletedDay}
        onBack={handleBackToOverview}
        onMarkComplete={handleMarkComplete}
        onLaunchAssessment={handleLaunchAssessment}
      />
    )
  }

  return <ThirtyDayCurriculumOverview onSelectDay={handleSelectDay} refreshKey={refreshKey} />
}
