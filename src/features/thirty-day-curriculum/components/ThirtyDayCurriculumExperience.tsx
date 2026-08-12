'use client'

import { useState } from 'react'
import { CurriculumAssessmentCanvas } from './CurriculumAssessmentCanvas'
import { ThirtyDayCurriculumDayDetail } from './ThirtyDayCurriculumDayDetail'
import { ThirtyDayCurriculumOverview } from './ThirtyDayCurriculumOverview'
import { loadCurriculumProgress, markCurriculumDayComplete, recordCurriculumCheckpoint, type CurriculumCheckpointResult } from '../curriculumProgress'

type CurriculumView = 'overview' | 'day-detail' | 'assessment'

function getMostRecentTrueWpm(day: number): number | null {
  const progress = loadCurriculumProgress()
  const priorCheckpoints = Object.values(progress.checkpoints)
    .filter((checkpoint) => checkpoint.day < day)
    .sort((a, b) => b.day - a.day)
  return priorCheckpoints[0]?.trueWpm ?? null
}

// Root client orchestrator — a single route, client-state-driven view
// machine (Overview <-> Day Detail <-> Assessment) rather than per-day
// dynamic routes, mirroring QuantumJourneySession.tsx's own
// local-`level`-state approach. `refreshKey` forces the Overview to
// re-read localStorage after any mutation (mark-complete or a recorded
// checkpoint) without needing a shared store — the same "bump a key to
// force a re-read" trick this project already uses wherever a sibling
// component owns the write.
export function ThirtyDayCurriculumExperience(): React.JSX.Element {
  const [view, setView] = useState<CurriculumView>('overview')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [progress, setProgress] = useState(() => loadCurriculumProgress())

  function refreshProgress(): void {
    setProgress(loadCurriculumProgress())
    setRefreshKey((key) => key + 1)
  }

  function handleSelectDay(day: number): void {
    setSelectedDay(day)
    setView('day-detail')
  }

  function handleBackToOverview(): void {
    refreshProgress()
    setView('overview')
    setSelectedDay(null)
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
        onBack={handleBackToOverview}
        onMarkComplete={handleMarkComplete}
        onLaunchAssessment={handleLaunchAssessment}
      />
    )
  }

  return <ThirtyDayCurriculumOverview onSelectDay={handleSelectDay} refreshKey={refreshKey} />
}
