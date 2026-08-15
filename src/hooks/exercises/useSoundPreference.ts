'use client'

import { useEffect, useState } from 'react'
import {
  broadcastSoundPreferenceChange,
  loadSoundEnabledPreference,
  saveSoundEnabledPreference,
  subscribeToSoundPreferenceChange,
} from '@/lib/audio/soundPreference'

// React binding for the Global Sound Preference™ (soundPreference.ts) —
// used by the Settings page toggle. Exercises that just need to check
// the preference before playing a sound don't need this hook at all
// (soundEngine.ts's playTone already reads loadSoundEnabledPreference()
// directly); this is only for UI that displays/changes the setting.
export function useSoundPreference(): readonly [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabledState] = useState(true)

  useEffect(() => {
    setEnabledState(loadSoundEnabledPreference())
    return subscribeToSoundPreferenceChange(() => setEnabledState(loadSoundEnabledPreference()))
  }, [])

  function setEnabled(next: boolean): void {
    saveSoundEnabledPreference(next)
    setEnabledState(next)
    broadcastSoundPreferenceChange()
  }

  return [enabled, setEnabled] as const
}
