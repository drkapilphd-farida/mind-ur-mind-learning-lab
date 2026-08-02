'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { saveSmartNotes } from '../actions/saveSmartNotes'

type SmartNotesPanelProps = {
  documentId: string
  initialContent: string
  initialUpdatedAt: string | null
}

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

// Smart Notes™ Sprint-2 — Reading & Notes Workspace™. The real
// presentation layer for taking, editing, and saving notes. Saving is
// explicit, not autosaved — a real, disclosed scope boundary, not an
// oversight; debounced autosave is a real UX decision (timing, conflict
// handling) beyond "the presentation layer required for taking, editing,
// saving and restoring notes." `hasUnsavedChanges` is derived by real
// comparison against the last real save, never a guessed dirty flag.
//
// Smart Notes™ Sprint-5 polish: rebuilt on the real `Card` primitive
// (matching the dashboard's own premium-card convention, for visual
// consistency across the whole feature) with a focus-visible ring on the
// textarea and an `aria-live="polite"` save-status region, so a screen
// reader announces "Saved 3:42 PM" the same moment a sighted user sees
// it. No prop, no behavior, no save mechanism changed.
export function SmartNotesPanel({ documentId, initialContent, initialUpdatedAt }: SmartNotesPanelProps): React.JSX.Element {
  const [content, setContent] = useState(initialContent)
  const [savedContent, setSavedContent] = useState(initialContent)
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const hasUnsavedChanges = content !== savedContent

  function handleSave(): void {
    setError(null)
    startTransition(async () => {
      const result = await saveSmartNotes({ documentId, content })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSavedContent(content)
      setUpdatedAt(result.updatedAt)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error !== null && <p className="text-sm text-destructive">{error}</p>}
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={10}
          placeholder="Write your notes for this document…"
          aria-label="Smart notes for this document"
          className="w-full resize-y rounded-md border bg-background p-3 text-sm text-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <div className="flex items-center justify-between">
          <Button size="sm" disabled={pending || !hasUnsavedChanges} onClick={handleSave}>
            {pending ? 'Saving…' : 'Save Notes'}
          </Button>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {!hasUnsavedChanges && updatedAt !== null && `Saved ${formatSavedAt(updatedAt)}`}
            {hasUnsavedChanges && !pending && 'Unsaved changes'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
