import { describe, expect, it } from 'vitest'
import { MEMORY_DISCOVERY_SCENES } from './types'
import {
  MEMORY_MISSION_ACHIEVEMENT,
  MEMORY_MISSION_INTRO_COPY,
  MEMORY_MISSION_LABEL,
  MEMORY_MISSION_ORDER,
  MISSION_SCENES,
  SCENE_TO_MISSION,
} from './memoryMissions'

describe('memoryMissions', () => {
  it('FIX-01 — locks the exact 5-Mission order from the brief', () => {
    expect(MEMORY_MISSION_ORDER).toEqual(['visual', 'number', 'word', 'pattern', 'recognition'])
  })

  it('every real Mission scene is a real scene from MEMORY_DISCOVERY_SCENES', () => {
    const allMissionScenes = MEMORY_MISSION_ORDER.flatMap((mission) => MISSION_SCENES[mission])
    for (const missionScene of allMissionScenes) {
      expect(MEMORY_DISCOVERY_SCENES).toContain(missionScene)
    }
  })

  it('every real scene except welcome/learning-memory-profile belongs to exactly one real Mission', () => {
    const trackedScenes = MEMORY_DISCOVERY_SCENES.filter((scene) => scene !== 'welcome' && scene !== 'learning-memory-profile')
    for (const scene of trackedScenes) {
      expect(SCENE_TO_MISSION[scene]).toBeDefined()
    }
    expect(SCENE_TO_MISSION.welcome).toBeUndefined()
    expect(SCENE_TO_MISSION['learning-memory-profile']).toBeUndefined()
  })

  it('no real scene is claimed by more than one real Mission', () => {
    const allMissionScenes = MEMORY_MISSION_ORDER.flatMap((mission) => MISSION_SCENES[mission])
    expect(new Set(allMissionScenes).size).toBe(allMissionScenes.length)
  })

  it('FIX-04 — every real Mission gets its own distinct real achievement message', () => {
    const messages = MEMORY_MISSION_ORDER.map((mission) => MEMORY_MISSION_ACHIEVEMENT[mission])
    expect(new Set(messages).size).toBe(messages.length)
  })

  it('FIX-02 — every real Mission Intro line is short (no long paragraphs)', () => {
    for (const mission of MEMORY_MISSION_ORDER) {
      expect(MEMORY_MISSION_INTRO_COPY[mission].split(' ').length).toBeLessThanOrEqual(14)
    }
  })

  it('every real Mission has a real, non-empty label', () => {
    for (const mission of MEMORY_MISSION_ORDER) {
      expect(MEMORY_MISSION_LABEL[mission].length).toBeGreaterThan(0)
    }
  })
})
