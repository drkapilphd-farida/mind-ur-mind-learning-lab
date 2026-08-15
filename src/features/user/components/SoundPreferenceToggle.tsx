'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useSoundPreference } from '@/hooks/exercises/useSoundPreference'

// Global Sound Preference™ — the one place a student turns exercise
// sound (tap chimes, correct/incorrect cues, ambient focus drones) on or
// off app-wide. Defaults to on; every exercise's audio already checks
// this same preference (see soundPreference.ts), so flipping it here
// takes effect immediately, including in an exercise already open in
// another tab.
export function SoundPreferenceToggle(): React.JSX.Element {
  const [enabled, setEnabled] = useSoundPreference()

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-3">
      <div className="flex items-center gap-3">
        {enabled ? (
          <Volume2 className="size-4 shrink-0 text-foreground" aria-hidden="true" />
        ) : (
          <VolumeX className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">Exercise Sound Effects</p>
          <p className="text-xs text-muted-foreground">Tap chimes, correct/incorrect cues, and ambient focus tones during exercises.</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Exercise sound effects" />
    </div>
  )
}
