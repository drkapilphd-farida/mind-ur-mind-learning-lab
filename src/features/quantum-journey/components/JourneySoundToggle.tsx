'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useSoundPreference } from '@/hooks/exercises/useSoundPreference'

// In-Session Audio Toggle™ — a compact, icon-only variant of the same
// global Sound On/Off preference src/features/user/components/
// SoundPreferenceToggle.tsx already exposes on the Settings page (same
// hook, same underlying localStorage-backed switch — see
// useSoundPreference's own doc comment), just reachable inline during
// the journey itself instead of only from Settings. Off = Mute, On =
// Play — deliberately not a separate, non-persisted "Pause" state; this
// is the one real sound preference every exercise's audio already reads.
export function JourneySoundToggle(): React.JSX.Element {
  const [enabled, setEnabled] = useSoundPreference()

  return (
    <div className="flex items-center gap-1.5">
      {enabled ? (
        <Volume2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      ) : (
        <VolumeX className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} aria-label={enabled ? 'Mute session sound' : 'Play session sound'} />
    </div>
  )
}
