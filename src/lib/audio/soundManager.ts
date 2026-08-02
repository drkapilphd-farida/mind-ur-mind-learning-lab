export type SoundId = 'inhale' | 'hold' | 'exhale' | 'completion' | 'ambient'

export type SoundSettings = {
  enabled: boolean
}

// Sounds are off by default and never activated by any call site in this
// codebase yet — this module is the future-ready architecture (settings +
// call sites), not a working audio player. No audio assets or <audio>/Web
// Audio backend exist yet; playSound is a documented no-op until they do,
// so activating sound later is a one-line change here, not a call-site rewrite.
let settings: SoundSettings = { enabled: false }

export function getSoundSettings(): SoundSettings {
  return settings
}

export function setSoundEnabled(enabled: boolean): void {
  settings = { ...settings, enabled }
}

export function playSound(_soundId: SoundId): void {
  if (!settings.enabled) return
  // Intentionally no-op: no audio assets are wired up yet.
}
