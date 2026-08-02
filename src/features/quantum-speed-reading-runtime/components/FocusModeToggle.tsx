import { Focus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type FocusModeToggleProps = {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

// Quantum Speed Reading™ Production Sprint-3. Focus Mode — the in-page
// half (hides this page's own secondary chrome: title, timer, progress).
// The outer app chrome (sidebar/topbar) is already hidden for this whole
// route via AppShell's existing, reused `IMMERSIVE_ROUTE_PATTERNS`
// mechanism — this toggle only controls what's genuinely local to this
// component tree.
export function FocusModeToggle({ enabled, onChange }: FocusModeToggleProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Focus className="size-4 text-muted-foreground" aria-hidden="true" />
      <Label htmlFor="focus-mode-toggle" className="text-sm text-muted-foreground">
        Focus Mode
      </Label>
      <Switch id="focus-mode-toggle" checked={enabled} onCheckedChange={onChange} />
    </div>
  )
}
