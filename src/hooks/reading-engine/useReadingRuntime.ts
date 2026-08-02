'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { computeWpm, computeUnitDwellMs, countWords } from '@/features/reading-engine/readingMetrics'
import type { ReadingRuntimePhase } from '@/features/reading-engine/types'

const TICK_MS = 100
const DEFAULT_TARGET_WPM = 250

export type UseReadingRuntimeResult = {
  phase: ReadingRuntimePhase
  targetWpm: number
  setTargetWpm: (wpm: number) => void
  currentUnitIndex: number
  currentUnit: string | null
  wordsRead: number
  totalWords: number
  elapsedMs: number
  liveWpm: number
  progressPercent: number
  wasFinishedEarly: boolean
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  finish: () => void
}

// Master Reading Engine™ (Sprint 3.1A) — content-agnostic pacing engine.
// Generalizes useVerticalWordReadingRuntime.ts: a "unit" is a plain string
// (one word, a phrase, a whole paragraph — this hook never inspects which).
// The dwell time before advancing past a unit scales with that unit's own
// word count (`countWords(unit) * (60000/targetWpm)`), not a fixed
// per-unit constant — so a future 3-word phrase or 40-word paragraph unit
// paces correctly with zero changes here, purely by how the caller chunks
// its string array. Because that threshold varies per unit, it's read fresh
// from the current unit inside every tick via refs, not hoisted once into
// the effect closure the way a fixed per-word constant could be.
export function useReadingRuntime(units: readonly string[], initialTargetWpm = DEFAULT_TARGET_WPM): UseReadingRuntimeResult {
  const totalUnits = units.length

  const [phase, setPhase] = useState<ReadingRuntimePhase>('settings')
  const [targetWpm, setTargetWpm] = useState(initialTargetWpm)
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [wasFinishedEarly, setWasFinishedEarly] = useState(false)

  const msSinceLastUnitRef = useRef(0)
  const unitsRef = useRef(units)
  const indexRef = useRef(currentUnitIndex)
  const targetWpmRef = useRef(targetWpm)
  unitsRef.current = units
  indexRef.current = currentUnitIndex
  targetWpmRef.current = targetWpm

  useEffect(() => {
    if (phase !== 'reading') return

    const interval = setInterval(() => {
      setElapsedMs((ms) => ms + TICK_MS)
      msSinceLastUnitRef.current += TICK_MS

      const currentUnit = unitsRef.current[indexRef.current]
      if (currentUnit === undefined) return

      const msForThisUnit = computeUnitDwellMs(currentUnit, targetWpmRef.current)
      if (msSinceLastUnitRef.current >= msForThisUnit) {
        msSinceLastUnitRef.current -= msForThisUnit
        setCurrentUnitIndex((index) => Math.min(index + 1, unitsRef.current.length))
      }
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [phase])

  // Natural completion — reached the end of the unit list while still reading.
  useEffect(() => {
    if (phase === 'reading' && currentUnitIndex >= totalUnits) {
      setPhase('complete')
    }
  }, [phase, currentUnitIndex, totalUnits])

  const totalWords = useMemo(() => units.reduce((sum, unit) => sum + countWords(unit), 0), [units])
  const wordsRead = useMemo(() => units.slice(0, currentUnitIndex).reduce((sum, unit) => sum + countWords(unit), 0), [units, currentUnitIndex])

  function resetToStart(): void {
    setCurrentUnitIndex(0)
    setElapsedMs(0)
    setWasFinishedEarly(false)
    msSinceLastUnitRef.current = 0
  }

  function start(): void {
    resetToStart()
    setPhase('reading')
  }

  function pause(): void {
    setPhase((current) => (current === 'reading' ? 'paused' : current))
  }

  function resume(): void {
    setPhase((current) => (current === 'paused' ? 'reading' : current))
  }

  function restart(): void {
    resetToStart()
    setPhase('reading')
  }

  function finish(): void {
    setPhase((current) => {
      if (current !== 'reading' && current !== 'paused') return current
      setWasFinishedEarly(indexRef.current < totalUnits)
      return 'complete'
    })
  }

  const liveWpm = computeWpm(wordsRead, elapsedMs)
  const progressPercent = totalWords > 0 ? Math.round((wordsRead / totalWords) * 100) : 0

  return {
    phase,
    targetWpm,
    setTargetWpm,
    currentUnitIndex,
    currentUnit: units[currentUnitIndex] ?? units[totalUnits - 1] ?? null,
    wordsRead,
    totalWords,
    elapsedMs,
    liveWpm,
    progressPercent,
    wasFinishedEarly,
    start,
    pause,
    resume,
    restart,
    finish,
  }
}
