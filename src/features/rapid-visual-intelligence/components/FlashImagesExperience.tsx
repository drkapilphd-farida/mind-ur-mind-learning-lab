'use client'

import { useState, useMemo } from 'react'
import {
  Sun, Moon, Star, Heart, Home, Eye, Zap, Leaf, Flame, Cloud,
  BookOpen, Brain, Target, Trophy, Compass, Diamond, Mountain, Clock, Bell, Shield,
  Settings, BarChart2, GitBranch, Hexagon, Octagon, Triangle, Circle, Square, LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import { FLASH_IMAGES_DEFINITION } from '../definitions/flashImagesDefinition'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { ensureMinItems } from '@/lib/exercise-engine/datasetValidator'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { flashDurationToDifficulty } from '../lib/flashUtils'
import type { SessionItem } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'
import '@/lib/exercise-engine/datasets/index'

const EXERCISE_ID = 'flash-images'
const ITEMS_PER_SESSION = 20

// Map icon names to lucide components for the stimulus renderer
const ICON_MAP: Record<string, LucideIcon> = {
  Sun, Moon, Star, Heart, Home, Eye, Zap, Leaf, Flame, Cloud,
  BookOpen, Brain, Target, Trophy, Compass, Diamond, Mountain, Clock, Bell, Shield,
  Settings, BarChart2, GitBranch, Hexagon, Octagon, Triangle, Circle, Square, LayoutGrid,
}

function renderIcon(iconName: string): React.ReactNode {
  const Icon = ICON_MAP[iconName]
  if (!Icon) return <span className="text-4xl font-bold">{iconName}</span>
  return <Icon className="size-16 text-foreground" strokeWidth={1.5} aria-hidden="true" />
}

function buildSessionItems(flashDurationMs: FlashDuration, seed: number): SessionItem[] {
  const difficulty = flashDurationToDifficulty(flashDurationMs)
  const raw = getContentForExercise({ contentType: 'icon', locale: 'en', difficulty, count: ITEMS_PER_SESSION + 10, seed })
  const pool = ensureMinItems(raw, ITEMS_PER_SESSION, seed)
  const stimuli = pool.slice(0, ITEMS_PER_SESSION)
  const distractorPool = pool.slice(ITEMS_PER_SESSION)

  return stimuli.map((item, i) => {
    // Options are text labels (icon names); stimulus is rendered as an icon
    const targetLabel = item.contentLabel  // e.g. 'Sun', 'Moon'
    const d1 = distractorPool[i % distractorPool.length] ?? stimuli[(i + 1) % stimuli.length]
    const d2 = distractorPool[(i + 1) % distractorPool.length] ?? stimuli[(i + 2) % stimuli.length]
    const d3 = distractorPool[(i + 2) % distractorPool.length] ?? stimuli[(i + 3) % stimuli.length]
    const rawOptions = [targetLabel, (d1 ?? item).contentLabel, (d2 ?? item).contentLabel, (d3 ?? item).contentLabel]
    const sortSeed = (seed + i) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? targetLabel,
      rawOptions[(sortSeed + 1) % 4] ?? rawOptions[1] ?? 'Moon',
      rawOptions[(sortSeed + 2) % 4] ?? rawOptions[2] ?? 'Star',
      rawOptions[(sortSeed + 3) % 4] ?? rawOptions[3] ?? 'Heart',
    ]
    const correctIndex = options.indexOf(targetLabel)
    return {
      id: `${EXERCISE_ID}-${item.id}`,
      stimulus: item.content,         // icon name (e.g. 'Sun') — rendered by renderStimulus
      stimulusLabel: item.contentLabel,
      renderAs: 'icon' as const,
      options,                         // text label options
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

export function FlashImagesExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const state = useMemo(() => loadState(EXERCISE_ID), [])
  const items = useMemo(
    () => buildSessionItems(state.currentSpeedMs as FlashDuration, Date.now() + sessionKey * 99991),
    [state.currentSpeedMs, sessionKey],
  )

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={FLASH_IMAGES_DEFINITION}
      items={items}
      renderStimulus={renderIcon}
      onRestart={() => setSessionKey((k) => k + 1)}
    />
  )
}
