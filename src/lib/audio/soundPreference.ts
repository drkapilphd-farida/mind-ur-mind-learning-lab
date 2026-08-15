'use client'

// Global Sound Preference™ — the one real, app-wide on/off switch every
// exercise's audio (the shared chime engine — soundEngine.ts — and every
// exercise's own ambient harmonic drone) checks before playing anything.
// Mirrors the localStorage-backed pattern esp-zener-telepathy's own local
// mute toggle already established (espZenerSound.ts), just promoted to a
// single shared key instead of a per-feature one. Defaults to ON
// (sound-on) when nothing has been saved yet, matching the brief.
const SOUND_ENABLED_STORAGE_KEY = 'qsr-sound-enabled'

export function loadSoundEnabledPreference(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY)
    if (raw === null) return true
    return raw === 'true'
  } catch {
    return true
  }
}

export function saveSoundEnabledPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(enabled))
  } catch {
    // localStorage full or blocked — the preference just resets next visit
  }
}

// Cross-tab/same-tab sync: the Settings toggle and any currently-mounted
// exercise both read this key, so a change in one tab (or the Settings
// page open in a background tab) should be reflected without a full
// reload. Native `storage` events only fire in OTHER tabs/windows, not
// the one that made the change — dispatching a custom event covers the
// same-tab case (Settings toggle changing sound while an exercise is
// already mounted elsewhere in the same tab, e.g. two panes).
const SOUND_PREFERENCE_EVENT = 'qsr-sound-preference-change'

export function broadcastSoundPreferenceChange(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SOUND_PREFERENCE_EVENT))
}

export function subscribeToSoundPreferenceChange(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handleStorage = (event: StorageEvent): void => {
    if (event.key === SOUND_ENABLED_STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(SOUND_PREFERENCE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(SOUND_PREFERENCE_EVENT, onChange)
  }
}
