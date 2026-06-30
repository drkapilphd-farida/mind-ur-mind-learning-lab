'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sun, Moon, Star, Heart, Home, Eye, Zap, Leaf, Flame, Cloud,
  BookOpen, Brain, Target, Trophy, Compass, Diamond, Mountain, Clock, Bell, Shield,
  Settings, BarChart2, GitBranch, Hexagon, Octagon, Triangle, Circle, Square, LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { FlashCanvas, type FlashItem } from './FlashCanvas'
import { SessionResultScreen } from './SessionResultScreen'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { getStoredDuration, saveDuration, shuffleIndices, type SessionSummary, ITEMS_PER_SESSION } from '../adaptiveEngine'
import { getIconsByDifficulty, getIconDistractors } from '../data/imageSets'
import { LAB_ID } from '../rapidVisualModule'

const EXERCISE_ID = 'flash-images'
const LAB_HREF = '/labs/quantum-speed-reading/rapid-visual-intelligence'

const ICON_MAP: Record<string, LucideIcon> = {
  Sun, Moon, Star, Heart, Home, Eye, Zap, Leaf, Flame, Cloud,
  BookOpen, Brain, Target, Trophy, Compass, Diamond, Mountain, Clock, Bell, Shield,
  Settings, BarChart2, GitBranch, Hexagon, Octagon, Triangle, Circle, Square, LayoutGrid,
}

function renderIcon(id: string): React.ReactNode {
  const Icon = ICON_MAP[id]
  if (!Icon) return <span className="text-4xl">{id}</span>
  return <Icon className="size-16 text-foreground" strokeWidth={1.5} aria-hidden="true" />
}

function buildItems(flashDurationMs: number, seed: number): FlashItem[] {
  const pool = getIconsByDifficulty(flashDurationMs)
  const indices = shuffleIndices(pool.length, seed)

  return indices.slice(0, ITEMS_PER_SESSION).map((idx, i) => {
    const target = pool[idx % pool.length]!
    const distractors = getIconDistractors(target.id, pool)
    const rawOptions = [target.label, ...distractors.map((d) => d.label)]
    const sortSeed = (seed + i) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? target.label,
      rawOptions[(sortSeed + 1) % 4] ?? distractors[0]?.label ?? 'none',
      rawOptions[(sortSeed + 2) % 4] ?? distractors[1]?.label ?? 'none',
      rawOptions[(sortSeed + 3) % 4] ?? distractors[2]?.label ?? 'none',
    ]
    const correctIndex = options.indexOf(target.label)

    return {
      id: `${EXERCISE_ID}-${i}`,
      stimulus: target.id,   // lucide icon name
      stimulusIsIcon: true,
      stimulusLabel: target.label,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashImagesExperience(): React.JSX.Element {
  const router = useRouter()
  const [sessionKey, setSessionKey] = useState(0)
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const flashDurationMs = getStoredDuration(EXERCISE_ID)
  const items = useMemo(() => buildItems(flashDurationMs, Date.now() + sessionKey), [flashDurationMs, sessionKey])

  async function handleComplete(result: SessionSummary): Promise<void> {
    saveDuration(EXERCISE_ID, result.nextDurationMs)
    await savePracticeSession({ labId: LAB_ID, exerciseId: EXERCISE_ID, durationMs: 60000, completed: result.accuracyPercent >= 60 })
    setSummary(result)
  }

  if (summary !== null) {
    return <SessionResultScreen exerciseName="Flash Icons™" summary={summary} trainsAbility="Visual symbol recognition" labHref={LAB_HREF} onPracticeAgain={() => { setSummary(null); setSessionKey((k) => k + 1) }} />
  }

  return (
    <FlashCanvas
      key={sessionKey}
      exerciseId={EXERCISE_ID}
      exerciseName="Flash Icons™"
      items={items}
      flashDurationMs={flashDurationMs}
      renderStimulus={renderIcon}
      onComplete={handleComplete}
      onExit={() => router.push(LAB_HREF)}
    />
  )
}
